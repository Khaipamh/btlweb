const path = require('path');
const { sequelize, connectDB, models } = require('../src/config/database');

async function main() {
  const storage = sequelize.options.storage;
  console.log('DB file:', path.resolve(storage));
  await connectDB();

  const [tables] = await sequelize.query(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  console.log('\nTables (' + tables.length + '):', tables.map((t) => t.name).join(', '));

  const counts = {};
  for (const name of Object.keys(models)) {
    try {
      counts[name] = await models[name].count();
    } catch (e) {
      counts[name] = 'ERR: ' + e.message;
    }
  }
  console.log('\nRow counts:');
  Object.entries(counts).forEach(([k, v]) => console.log('  ', k + ':', v));

  const [fk] = await sequelize.query('PRAGMA foreign_keys');
  console.log('\nPRAGMA foreign_keys:', fk[0]?.foreign_keys);

  const orphans = await sequelize.query(`
    SELECT oi.order_item_id, oi.order_id
    FROM ORDER_ITEMS oi
    LEFT JOIN ORDERS o ON o.order_id = oi.order_id
    WHERE o.order_id IS NULL
    LIMIT 5
  `);
  if (orphans[0]?.length) console.log('\n⚠ Orphan ORDER_ITEMS:', orphans[0].length);

  const multiCart = await sequelize.query(`
    SELECT user_id, COUNT(*) as c FROM CARTS GROUP BY user_id HAVING c > 1 LIMIT 5
  `);
  if (multiCart[0]?.length) console.log('⚠ Users with multiple carts:', multiCart[0]);

  await sequelize.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
