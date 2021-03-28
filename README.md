# email-feedback

This is a simple backend for a feedback form which I use on https://roamiiing.ru.

Usage:
* Fill in `.env`
* Run `npm start`
* Make a `POST` request to `/` with following data:
```json
{
  "name": "YourName",
  "email": "youremail@example.com",
  "message": "Your message here."
}
```
Make sure your data is valid:
* `name` must contain only letters and spaces and its length must be between 1 and 30
* `email` must be valid
* `message` must contain only letters and punctuation marks and its length must be between 100 and 10000

The message will be sent from `SMTP_HOST` to itself.
