const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Pool}=require('pg');
const {createStore}=require('../server/store.cjs');
const fs=require('node:fs');
test('real PostgreSQL: concurrent settlement, restart persistence, unique IDs and rollback', {skip:!process.env.TEST_DATABASE_URL},async()=>{
 const pool=new Pool({connectionString:process.env.TEST_DATABASE_URL});
 // Dedicated disposable database ONLY: this test creates/drops its own schema.
 const schema='wt_test_'+Date.now();
 await pool.query(`CREATE SCHEMA ${schema}`);
 const isolated=new Pool({connectionString:process.env.TEST_DATABASE_URL,options:`-c search_path=${schema}`});
 try {
  await isolated.query(fs.readFileSync('migrations/001_orders.sql','utf8'));
  const store=createStore(isolated);
  const order={reference:'WT-test',request_hash:'a',payload_hash:'b',quote:{packageId:'fixture'},customer:{email:'test@example.invalid'},amount_kobo:100,currency:'NGN'};
  const created=await Promise.all(Array.from({length:8},()=>store.create(order)));
  assert.equal(created.filter(r=>r.inserted).length,1);
  await Promise.all(Array.from({length:8},()=>store.markPaid(order.reference,'123')));
  assert.equal((await isolated.query('SELECT * FROM payment_outbox')).rowCount,1);
  assert.equal((await createStore(isolated).get(order.reference)).status,'paid');
  const other={...order,reference:'WT-second',request_hash:'other'};await store.create(other);
  await assert.rejects(store.markPaid(other.reference,'123'));
  assert.equal((await store.get(other.reference)).status,'pending');
  // Force outbox failure: both writes must roll back, never paid without a durable event.
  await isolated.query('ALTER TABLE payment_outbox ADD CONSTRAINT reject_second CHECK (reference <> \'WT-second\')');
  await assert.rejects(store.markPaid(other.reference,'456'));
  assert.equal((await store.get(other.reference)).status,'pending');
  const {createService}=require('../server/payments.cjs');
  const rules={version:'fixture',packages:{test:{approved:true,billingMode:'one_time',discountBpsByMonths:{1:0},tiers:{basic:{feeKobo:100,adMinKobo:0,adMaxKobo:0}}}}};
  let calls=0;
  const service=createService({store,rules,paystack:{initialize:async()=>{calls++;throw new Error('timeout');}}});
  const input={packageId:'test',tier:'basic',durationMonths:1,adBudgetKobo:0,requestKey:'ab'.repeat(32),customer:{name:'Test',email:'test@example.invalid',phone:'0000000'}};
  await assert.rejects(service.initialize(input),/timeout/);
  await assert.rejects(service.initialize(input),/pending reconciliation/);
  assert.equal(calls,1);
 } finally {await isolated.end();await pool.query(`DROP SCHEMA ${schema} CASCADE`);await pool.end();}
});
