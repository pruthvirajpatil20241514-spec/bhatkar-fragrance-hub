const { logger } = require('../../utils/logger');
const { createTableUSers: createTableUSersQuery } = require('../queries');
const { createTableProducts: createTableProductsQuery } = require('../products.queries');

(() => {    
   require('../../config/db.config').query(createTableUSersQuery, (err, _) => {
        if (err) {
            logger.error(err.message);
            return;
        }
        logger.info('Table users created!');
        
        // Create products table
        require('../../config/db.config').query(createTableProductsQuery, (err, _) => {
            if (err) {
                logger.error(err.message);
                return;
            }
            logger.info('Table products created!');
            process.exit(0);
        });
    });
})();
