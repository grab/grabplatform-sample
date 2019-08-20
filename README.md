# GrabPlatform-Sample

This is a consolidated sample for all products offered on [Grab's Developer Portal](https://developer.grab.com/products).

Please note that the code in this sample does not necessarily reflect Grab's programming practices - its main purpose is to help engineers working on Grab API integration have a better idea of how to do so. For example, instead of directly calling HTTP endpoints correctly in view components, you should look for ways to perform dependency injection for easier testing.

## Prerequisites

1. `Homebrew`: Run `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"` in terminal.
2. `yarn`: `brew install yarn`.

## How to run

1. Go to root of the project, run this command to generate a self-signed certificate for HTTPS:

```shell
openssl req -nodes -new -x509 -keyout server/server.key -out server/server.cert
```

2. Edit `/etc/hosts` with `sudo vi /etc/hosts` and append `127.0.0.1 grabplatform.stg-myteksi.com` and `127.0.0.1 grabplatform.grab.com`. Save the file with `:x`. This must be done because GrabID does not accept `localhost`.
3. In the root folder, run `yarn` to install dependencies, and `yarn start:stg` to start the project. `https://grabplatform.grab.com:3000/` will open in your browser of choice.
4. Configure the redirect URLs for your OAuth client in `https://developer-beta.stg-myteksi.com` (under your project > OAuth clients > Platform configurations) to add both:

- `https://grabplatform.grab.com`
- `https://grabplatform.grab.com/**`

5. Navigate to specific products by clicking the categories, and then clicking the underlying products.
6. Authorize with GrabID first, then follow instructions on screen to access the related endpoint.
7. When you are in the app, you can configure the necessary details. These configs will be saved in the backend and prefilled the next time you start the app:

- Country Code.
- Partner ID.
- Partner HMAC secret.
- Client ID.
- Client secret.
- Merchant ID.
- Currency.

## Testing in production

- Open `package.json` and change `host` to `grabplatform.grab.com` and `proxy` to `https://grabplatform.grab.com:8000`. Please change back to `stg-myteksi.com` for staging tests.
- Update configurations to use production credentials.
- Configure the redirect URLs for your OAuth client in `https://developer.stg-myteksi.com` to be the same as above.
- Run `yarn start:prd` instead of `yarn start:stg`.
- After you are done, revert the above changes to clean up.
