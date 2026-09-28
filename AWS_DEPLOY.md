# Deploying the backend to AWS

Target setup: **MongoDB Atlas** for the database, **App Runner** for the API,
**SSM Parameter Store** for secrets. App Runner gives you HTTPS with no load
balancer to configure, which matters because iOS blocks plain HTTP.

> **Do not use Amazon DocumentDB.** It advertises MongoDB compatibility but does
> not support everything this codebase uses (for example the `$dateToString`
> aggregation stage in `getAllAppointments`). Use MongoDB Atlas, which runs
> inside AWS and has a free tier.

---

## 1. Database — MongoDB Atlas

1. Create a free **M0 cluster**, hosted on **AWS**, in the region you will deploy
   to (match your S3 bucket's region, `eu-west-2`, to keep latency low).
2. Create two databases: `telemedicine_dev` and `telemedicine_prod`.
3. Create a database user with a strong generated password.
4. Network access: allow `0.0.0.0/0` initially. Once App Runner is up, replace it
   with a VPC connector or the service's egress addresses.
5. Copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/telemedicine_prod?retryWrites=true&w=majority`

---

## 2. Secrets — SSM Parameter Store

Store each secret as a `SecureString`. Parameter Store is free at standard tier;
Secrets Manager charges per secret per month and you do not need its rotation.

```bash
REGION=eu-west-2

# Generate a production JWT secret. Use a DIFFERENT value from your local .env,
# and never paste it into a terminal you keep logs of.
aws ssm put-parameter --region $REGION --type SecureString \
  --name /telemedicine/prod/JWT_SECRET \
  --value "$(node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")"

aws ssm put-parameter --region $REGION --type SecureString \
  --name /telemedicine/prod/MONGO_URL --value 'mongodb+srv://...'

aws ssm put-parameter --region $REGION --type SecureString \
  --name /telemedicine/prod/STRIPE_SECRET_KEY --value 'sk_live_or_test_...'

aws ssm put-parameter --region $REGION --type SecureString \
  --name /telemedicine/prod/STRIPE_WEBHOOK_SECRET --value 'whsec_...'

aws ssm put-parameter --region $REGION --type SecureString \
  --name /telemedicine/prod/OPENAI_API_KEY --value 'sk-...'
```

`API_PREFIX`, `SERVER_PORT`, `NODE_ENV` and `AWS_REGION` are not secret — set
them as plain App Runner environment variables.

---

## 3. Build and push the image to ECR

```bash
REGION=eu-west-2
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REPO=telemedicine-backend

aws ecr create-repository --repository-name $REPO --region $REGION

aws ecr get-login-password --region $REGION \
  | docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$REGION.amazonaws.com

# --platform matters: App Runner runs x86_64, and an Apple Silicon Mac builds
# arm64 by default. A mismatched image starts and immediately crashes.
docker build --platform linux/amd64 -t $REPO .

docker tag $REPO:latest $ACCOUNT.dkr.ecr.$REGION.amazonaws.com/$REPO:latest
docker push $ACCOUNT.dkr.ecr.$REGION.amazonaws.com/$REPO:latest
```

---

## 4. Create the App Runner service

- **Source:** the ECR image above; enable automatic deployment on new pushes.
- **Port:** `3000` (the Dockerfile's default and what `EXPOSE` declares).
- **Health check:** HTTP, path `/health`. That endpoint returns 503 while Mongo is
  disconnected, so a broken instance gets replaced instead of serving traffic.
- **Environment variables:**
  | Name | Value |
  |---|---|
  | `NODE_ENV` | `production` |
  | `SERVER_PORT` | `3000` |
  | `API_PREFIX` | `/api/v1` |
  | `AWS_REGION` | `eu-west-2` |
  | `S3_BUCKET_NAME` | your bucket |
- **Environment secrets:** reference the SSM parameters from step 2 by ARN.
- **Instance role:** attach a role granting `ssm:GetParameters`, `kms:Decrypt`,
  and `s3:PutObject` on your bucket. Then delete `AWS_ACCESS_KEY_ID` and
  `AWS_SECRET_ACCESS_KEY` from the environment — the role replaces them, and
  long-lived keys in env vars are the thing you are trying to avoid.

You get a URL like `https://xxxxx.eu-west-2.awsapprunner.com`. Verify:

```bash
curl https://xxxxx.eu-west-2.awsapprunner.com/health
# {"status":"ok","database":"connected","uptime":...}
```

---

## 5. Point Stripe at it

In the Stripe dashboard add a webhook endpoint:

```
https://xxxxx.eu-west-2.awsapprunner.com/api/v1/payment/webhook
```

Subscribe to `payment_intent.succeeded` and `payment_intent.payment_failed`.
Copy the signing secret into `/telemedicine/prod/STRIPE_WEBHOOK_SECRET`.

The webhook **rejects every request** when `STRIPE_WEBHOOK_SECRET` is unset. That
is deliberate — without it, signatures cannot be verified and anyone could confirm
a booking.

To test locally: `stripe listen --forward-to localhost:3001/api/v1/payment/webhook`

---

## 6. Point the app at it

In `TeleMedicine_Mobile/src/config/env.ts`, replace `PROD_API_URL` with your
App Runner URL. It must be `https://` — iOS App Transport Security blocks
cleartext, and the app will fail with no useful error if you use `http://`.

---

## Still to do before this is production-grade

- [ ] Rotate `JWT_SECRET` and purge `private.key` from git history — it was
      committed to a public repo and must be treated as compromised
- [ ] Replace `Access-Control-Allow-Origin: *` in `server.ts` with your real origins
- [ ] Lock Atlas network access down from `0.0.0.0/0`
- [ ] Add CloudWatch alarms on 5xx rate and health-check failures
- [ ] Separate dev and prod Atlas clusters and SSM paths
- [ ] Set up a staging App Runner service so `main` is not your first test

## Note on running locally

`npm start` now runs the compiled output (`node dist/server.js`), matching what
the container does. For local development with reload use **`npm run dev`**.
Always use `npm ci`, never `npm install` — this repo previously shipped a mongoose
install with missing files that `npm install` silently accepted.
