# AWS ECS Scheduled Task Alerts

This is an AWS CDK project demonstrating how to set up alerting for failing ECS scheduled tasks.

## Architecture

At a high level, this repository consists of the following:

* an ECS cluster with Fargate capacity providers,
* one container hosting application logic within [app](./app),
* an ECS Fargate task definition for the container,
* one EventBridge rule invoking the task periodically,
* an SNS topic with a configurable email subscription, and
* another EventBridge rule sending task exit failures to the SNS topic.

The email address for the SNS subscription is configured using env var `ALERT_EMAIL_ADDRESS`.

## Usage

This setup automatically invokes the ECS Fargate task periodically - set to every minute at the time of writing. Whenever the container exits with a [common failure code](https://aws.amazon.com/premiumsupport/knowledge-center/ecs-task-stopped/), email will be broadcasted to whichever address is set using env var `ALERT_EMAIL_ADDRESS`.

**Remember to tear down the infrastructure or disable the task invocation EventBridge rule when this is not actively in use!** Otherwise tasks will repeatedly spin up, and SNS will pollute your email inbox with task failure notifications.

## Development

This project applies [AWS CDK v2](https://docs.aws.amazon.com/cdk/v2/guide/home.html). This is a global installation required for development.

To build application and infrastructure code, run

```sh
npm run build
```

To deploy the application and infrastructure to AWS, run

```sh
cdk deploy
```
