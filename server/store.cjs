const { Pool } = require('pg');
function createStore(pool) {
  return {
    async create(o) {
      const r = await pool.query(`INSERT INTO payment_orders(reference,request_hash,payload_hash,quote,customer,amount_kobo,currency) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(request_hash) DO NOTHING RETURNING *`,[o.reference,o.request_hash,o.payload_hash,o.quote,o.customer,o.amount_kobo,o.currency]);
      return {inserted:r.rowCount === 1, order:r.rows[0] || (await pool.query('SELECT * FROM payment_orders WHERE request_hash=$1',[o.request_hash])).rows[0]};
    },
    async get(reference) { return (await pool.query('SELECT * FROM payment_orders WHERE reference=$1',[reference])).rows[0]; },
    async saveAuthorization(reference,url) { await pool.query('UPDATE payment_orders SET authorization_url=$2 WHERE reference=$1',[reference,url]); },
    async markPaid(reference,id) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query(`UPDATE payment_orders SET status='paid',transaction_id=$2,paid_at=now() WHERE reference=$1 AND status='pending' RETURNING reference`,[reference,id]);
        if (result.rowCount) await client.query('INSERT INTO payment_outbox(reference) VALUES($1) ON CONFLICT DO NOTHING',[reference]);
        await client.query('COMMIT');
      } catch (e) { await client.query('ROLLBACK'); throw e; }
      finally { client.release(); }
    }
  };
}
let pool;
function getPool(env) {
  if (!env.DATABASE_URL) throw new Error('Order storage is not configured');
  pool ||= new Pool({connectionString:env.DATABASE_URL,ssl:{rejectUnauthorized:true},max:2,connectionTimeoutMillis:5000,query_timeout:5000});
  return pool;
}
function productionStore(env) { return createStore(getPool(env)); }
module.exports = {createStore,productionStore,getPool};
