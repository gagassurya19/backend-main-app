const receiptHandler = require('../handlers/receiptHandler');
const Joi = require('@hapi/joi');

module.exports = [
  // Create receipt
  {
    method: 'POST',
    path: '/receipts',
    handler: receiptHandler.createReceipt,
    options: {
      validate: {
        payload: Joi.object({
          judul: Joi.string().required(),
          gambar: Joi.string().required(),
          deskripsi: Joi.string().max(500),
          labelBahan: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
          metodeMemasak: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
          kalori: Joi.number().min(0).required(),
          protein: Joi.number().min(0),
          lemak: Joi.number().min(0),
          karbohidrat: Joi.number().min(0),
          ingredients: Joi.array().items(
            Joi.object({
              bahan: Joi.string().required()
            })
          ),
          steps: Joi.array().items(
            Joi.object({
              description: Joi.string().required(),
              images: Joi.array().items(
                Joi.object({
                  url: Joi.string().required()
                })
              )
            })
          )
        })
      }
    }
  },
  
  // Get all receipts
  {
    method: 'GET',
    path: '/receipts',
    handler: receiptHandler.getAllReceipts,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          search: Joi.string()
        })
      }
    }
  },
  
  // Get receipt by ID
  {
    method: 'GET',
    path: '/receipts/{id}',
    handler: receiptHandler.getReceiptById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        })
      }
    }
  },
  
  // Update receipt
  {
    method: 'PUT',
    path: '/receipts/{id}',
    handler: receiptHandler.updateReceipt,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        }),
        payload: Joi.object({
          judul: Joi.string(),
          gambar: Joi.string(),
          deskripsi: Joi.string().max(500),
          labelBahan: Joi.alternatives().try(Joi.string(), Joi.object()),
          metodeMemasak: Joi.alternatives().try(Joi.string(), Joi.object()),
          kalori: Joi.number().min(0),
          protein: Joi.number().min(0),
          lemak: Joi.number().min(0),
          karbohidrat: Joi.number().min(0)
        })
      }
    }
  },
  
  // Delete receipt
  {
    method: 'DELETE',
    path: '/receipts/{id}',
    handler: receiptHandler.deleteReceipt,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required()
        })
      }
    }
  }
]; 