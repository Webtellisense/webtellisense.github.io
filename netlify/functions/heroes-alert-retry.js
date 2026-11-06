const {schedule}=require('@netlify/functions');
const {getPool}=require('../../server/store.cjs');
const {createAlertDispatcher}=require('../../server/purchase-alerts.cjs');
exports.handler=schedule('*/5 * * * *',async()=>{
 try {await createAlertDispatcher(getPool(process.env),process.env)();return {statusCode:200};}
 catch {console.error('Heroes alert retry unavailable; inspect outbox and configuration.');return {statusCode:503};}
});
