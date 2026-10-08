export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  isn: {
    baseUrl: process.env.ISN_BASE_URL ?? 'https://4isn.com',
    companyKey: process.env.ISN_COMPANY_KEY ?? '',
    accessKey: process.env.ISN_ACCESS_KEY ?? '',
    secretAccessKey: process.env.ISN_SECRET_ACCESS_KEY ?? '',
    officeUuid: process.env.ISN_OFFICE_UUID ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'super-secret-jwt-key-replace-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
});
