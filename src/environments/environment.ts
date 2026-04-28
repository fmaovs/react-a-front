export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  paymentLinkTest: {
    enabled: true,
    clientId: 7,
    transactionId: 742,
    reference: 'REF123456',
    amount: 100000,
    returnUrl: 'https://tu-sitio.com/retorno'
  },
  zolev: {
    urlToken: 'https://api.zolev.com', // Placeholder, user to provide
    idCliente: '12345',
    identificacion: '900123456',
    codigoUsuario: 'USR001',
    password: 'password123'
  }
};
