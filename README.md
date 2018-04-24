# Brigly: The Brigade SlackBot

A Slack bot for interacting with Brigade.

## Installing Brigly

Before getting started, this assumes you have the following installed and configured:

- Brigade _with publically routable endpoints_ (e.g. running this on minikube will be hard)
  - I would suggest taking the time to set up [Kube-lego](https://blog.jetstack.io/blog/kube-lego/)
    or another SSL ingress.
- Slack: You need admin access to your slack workspace
- Optional, but highly recommended
  - Helm: We'll install a new brigade project with Helm
  - Draft: We'll use this to deploy our Slack gateway

### In Slack

Brigly is not a hosted solution (I don't run a Brigly service that you can
connect to). Instead, you have to install Brigly into your workspace.

To do this:

1. Log into https://api.slack.com
2. In the upper right corner, click _Your Apps_
3. Click _Create New App_ (the green button)
4. Name your app, and then select the workspace where you want the bot to live.
5. Click the _Bots_ box to add a bot
6. Give that bot a name and screen name


Now you have a bot user. There are several pieces of information you will need
from the Slack API site, so don't close this browswer window just yet.

### Install the Bot Gateway

First, you will need to create a new Brigade project with the following secrets set:

1. Clone this repository.
2. Point your `kubectl` to the cluster you want to deploy
into (and the namespace that Brigade lives in)
3. Run `draft up`

Alternately, you can `helm install` the chart in this directory:

```console
$ helm install -n brigly-dev ./charts/chart
```

_In a moment, we will have to update these._ But first you need to configure your
environment to allow external access to the `brigly-dev-chart` service. I recommend
doing this by configuring an ingress and then modifying `charts/chart/values.yaml`
accordingly to enable ingress. You can also configure the service as a `LoadBalancer`
as well.

Once you have a public IP address, it is also a good idea to map that to a DNS name
if you can.

> Again, you are _strongly encouraged_ to go through the process of setting up SSL
> on your ingress or load balancer.

Re-run `draft up` or run `helm upgrade brigly-dev ./charts/chart` to have the new
ingress or load balancer features take effect.

At this point, you should be able to ping (from the public internet) the `healthz`
endpoint of your Slack gateway:

```console
$ curl https://$YOUR_DOMAIN/healthz
OK
```

Next you need to create a new Brigade project.

### Creating a Project

There are two things your project needs to do:

- Provide credentials for Slack
- Indicate where the `brigade.js` lives

Create your new project the usual way:

```
$ helm inspect values brigade/brigade-project > values.yaml
```

Along with the usual stuff, you need to set the following `secrets`:

```yaml
secrets:
  slackBotToken: "xoxb-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  slackClientID: "XXXXXXXXXXXXXXXXXXXXXXXXX"
  slackClientSecret: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  slackVerificationToken: "XXXXXXXXXXXXXXXXXXXXXXXX"
```

You get this information from api.slack.com from the following places:

- The following are all on the _Basic Information_ page or your app:
  - `slackClientID` is _Client ID_
  - `slackClientSecret` is _Client Secret_
  - `slackVerificationToken` is the _Verification Token_.
- `slackBotToken` takes a few steps to obtain.
  - In Basic Information, you will need to
    -  click `Install App to Workspace`
    - Authorize adding the bot
  - In the _OAuth And Permissions_ page, find _Bot User Oauth Access Token_. That
    is the value for `slackBotToken`.

Now re-load these values with `draft up` or `helm upgrade`.

## Enable Event Subscriptions

Now, on `api.slack.com`, go to the _Event Subscriptions_ page and _Enable Events_.
Then, in the _Request URL_ field, add a full URL to your Brigly gateway:
`htts://$YOUR_DOMAIN/slack/events` and click _Verify_.

Once it has verified, scroll down to _Subscribe to Bot Events_ and click
_Add Bot User Event_. Choose `app_mention` from the list. Then click _Save Changes_
in the lower-right corner.

That is it. At this point the bot should be showing up on your Slack workspace.
