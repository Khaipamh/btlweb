const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sahafa Bookstore',
      version: '1.0.0',
      description: 'Tài liệu API cho dự án Sahafa Bookstore',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5173',
        description: 'Máy chủ',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },

  // Dùng đường dẫn tuyệt đối để đảm bảo quét đúng các route
  apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };