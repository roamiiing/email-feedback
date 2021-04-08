const express = require('express');
const nodemailer = require('nodemailer');
const yup = require('yup');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required()
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s]*$/)
    .max(30),
  email: yup
    .string()
    .trim()
    .required()
    .email(),
  message: yup
    .string()
    .trim()
    .required()
    .min(100)
    .max(10000),
});

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ORIGIN,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: parseInt(SMTP_PORT, 10) === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const app = express();

app.use(express.json());
app.use(cors(ORIGIN || '*'));

app.get('/', (req, res) => {
  res.json({
    app: 'email-feedback',
    message: 'Make a POST request to "/" to send your message',
  });
});

app.use(rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
}));

app.post('/', async (req, res, next) => {
  const { body } = req;
  try {
    const { name, email, message } = await schema.validate(body);
    await transporter.sendMail({
      from: `<${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'New form message',
      text: `${name} (${email}): ${message}`,
    });
    res.json({
      success: true,
    });
  } catch (e) {
    if (e instanceof yup.ValidationError) {
      res.status(403);
      next(new Error('Bad request'));
    } else {
      res.status(500);
      next(new Error('Internal server error'));
    }
  }
});

app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Not found: ${req.originalUrl}`);
  next(error);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' && err.stack,
  });
});

const PORT = process.env.PORT || 3000;

const listener = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Listening for incoming requests on', listener.address().port);
});
