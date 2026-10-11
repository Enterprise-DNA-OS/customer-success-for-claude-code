#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
export const reads={
 accounts:'select id,name,owner,segment,contact from success.accounts order by name',
 contracts:'select c.id,a.name account,c.name,c.starts_on,c.renews_on,c.arr_cents,c.currency,c.status,c.evidence from success.contracts c join success.accounts a on a.id=c.account_id order by c.renews_on,c.id',
 'risk-review':'select name,owner,health,reasons from success.account_health order by name',
 'renewals-due':'select name,owner,renews_on,days_to_renewal,arr_cents,currency,health from success.renewal_queue order by renews_on,name',
 'adoption-review':'select name,observed_on,active_users,licensed_users,adoption_pct,health from success.account_health order by name',
 'customer-chase':"select name,owner,last_touch,reasons from success.account_health where last_touch is null or last_touch<current_date-30 order by name",
 attention:"select name,owner,health,reasons,renews_on from success.account_health where health!='healthy' or renews_on<current_date order by name",
 actions:'select * from success.action_queue order by due_on,id',
 objectives:'select o.id,a.name account,o.name,o.due_on,o.status,o.evidence from success.objectives o join success.accounts a on a.id=o.account_id order by o.due_on,o.id',
 touchpoints:'select t.id,a.name account,t.name,t.occurred_on,t.sentiment,t.actor from success.touchpoints t join success.accounts a on a.id=t.account_id order by t.occurred_on desc,t.id',
 usage:'select u.id,a.name account,u.observed_on,u.active_users,u.licensed_users,u.evidence from success.usage u join success.accounts a on a.id=u.account_id order by u.observed_on desc,u.id',
 'owner-load':"select owner,count(*)::int accounts,count(*) filter(where health='at risk')::int at_risk,count(*) filter(where health='unknown')::int unknown,sum(overdue_actions)::int overdue_actions from success.account_health group by owner order by owner",
 'revenue-review':"select currency,count(*)::int contracts,sum(arr_cents)::text arr_cents,sum(arr_cents) filter(where health='at risk')::text at_risk_arr_cents from success.account_health where contract_id is not null group by currency order by currency",
 compliance:'select name,finding from success.privacy_review where finding is not null order by name',
 history:'select name,actor,detail,created_at from success.activity order by created_at,id'
};
export const specs={
 ...Object.fromEntries(Object.keys(reads).map(k=>[k,[]])),
 help:[], 'weekly-review':[], qbr:['account'],
 'add-account':['name','owner','segment','contact','actor'],
 'add-contract':['account','name','start','renewal','arr','currency','actor'],
 'log-touch':['account','note','date','sentiment','actor'],
 'record-usage':['account','date','active','licensed','evidence','actor'],
 'add-action':['account','name','owner','due','actor'],
 'finish-action':['action','evidence','actor'],
 'add-objective':['account','name','due','actor'],
 'close-objective':['objective','outcome','evidence','actor'],
 'renewal-decision':['contract','outcome','next-renewal','arr','evidence','actor'],
 'review-privacy':['account','notice','retention','security','actor'],
 import:['file','mapping','currency','dry-run','actor'],
 export:['out'], 'draft-qbr':['account'], 'draft-renewal':['account']
};
const req=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`--${k} is required`);return o[k].trim();};
function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(`Invalid date: ${v}`);return v;}
function past(v){date(v);if(v>new Date().toISOString().slice(0,10))throw Error('Observation cannot be in the future');return v;}
function cents(v){if(!/^\d+(\.\d{1,2})?$/.test(String(v)))throw Error('Amount must be a nonnegative decimal with at most two places');const n=Math.round(Number(v)*100);if(!Number.isSafeInteger(n))throw Error('Amount is too large');return n;}
function integer(v){if(!/^\d+$/.test(String(v))||!Number.isSafeInteger(Number(v)))throw Error('Expected a nonnegative integer');return Number(v);}
function choice(v,allowed){if(!allowed.includes(v))throw Error(`Expected one of ${allowed.join(', ')}`);return v;}
function currency(v){if(!/^[A-Z]{3}$/.test(v))throw Error('Currency must be three uppercase letters');return v;}
export function parse(args){const pos=[],o={};for(let i=0;i<args.length;i++){const x=args[i];if(!x.startsWith('--')){pos.push(x);continue;}const at=x.indexOf('=');const k=x.slice(2,at<0?undefined:at);let v=at<0?true:x.slice(at+1);if(at<0&&!['json','dry-run','help'].includes(k)&&args[i+1]&&!args[i+1].startsWith('--'))v=args[++i];if(k in o)throw Error(`Repeated --${k}`);o[k]=v;}let cmd=pos[0]||'help';if(o.help){if(pos.length)throw Error('Use help as a command');cmd='help';delete o.help;}if(!specs[cmd])throw Error(`Unknown command ${cmd}`);if(pos.length>(cmd==='import'?2:1))throw Error('Unexpected positional argument');if(cmd==='import'&&pos[1]!=='totango')throw Error('Use import totango');for(const k of Object.keys(o)){if(k!=='json'&&!specs[cmd].includes(k))throw Error(`Unknown --${k} for ${cmd}`);if(['json','dry-run'].includes(k)&&o[k]!==true)throw Error(`--${k} takes no value`);}return {cmd,o};}
async function resolve(db,kind,value){if(!['accounts','contracts','actions','objectives'].includes(kind))throw Error('Invalid record kind');const rows=await db.query(`select id,name from success.${kind} where lower(name)=lower($1) or starts_with(id::text,$1) order by name,id`,[value]);if(rows.length!==1)throw Error(`${rows.length?'Ambiguous':'No matching'} ${kind}: ${value}${rows.map(r=>`\n${r.id}  ${r.name}`).join('')}`);return rows[0].id;}
async function insert(db,kind,values){const keys=Object.keys(values);return (await db.query(`insert into success.${kind} (${keys.join(',')}) values (${keys.map((_,i)=>`$${i+1}`).join(',')}) returning *`,Object.values(values)))[0];}
async function audit(db,cmd,actor,detail){await insert(db,'activity',{name:cmd,actor,detail:JSON.stringify(detail)});}
const recordSets=['accounts','contracts','usage','touchpoints','actions','objectives','activity'];
async function qbr(db,id){return {account:await db.query('select * from success.account_health where id=$1',[id]),objectives:await db.query('select name,due_on,status,evidence from success.objectives where account_id=$1 order by due_on,id',[id]),actions:await db.query('select name,owner,due_on,status,evidence from success.actions where account_id=$1 order by due_on,id',[id]),conversations:await db.query('select name,occurred_on,sentiment from success.touchpoints where account_id=$1 order by occurred_on desc,id',[id])};}
const mappings={id:'Account ID',name:'Account Name',owner:'Success Manager',segment:'Segment',renewal:'Contract Renewal Date',arr:'Contract Value',currency:'Currency',contact:'Contact'};
async function importTotango(db,o){const rows=parseCsv(fs.readFileSync(req(o,'file'),'utf8'));if(!rows.length)throw Error('CSV has no records');const map={...mappings};if(o.mapping){const supplied=JSON.parse(fs.readFileSync(o.mapping,'utf8'));if(!supplied||Array.isArray(supplied)||typeof supplied!=='object')throw Error('Mapping must be an object');for(const [k,v] of Object.entries(supplied)){if(!(k in map)||typeof v!=='string'||!v.trim())throw Error(`Invalid mapping: ${k}`);map[k]=v;}}
 const seen=new Set();let inserted=0,skipped=0;
 for(const raw of rows){const get=k=>String(pick(raw,map[k])).trim();const id=get('id'),name=get('name');if(!id||!name)throw Error('Each account requires Account ID and Account Name; use --mapping for renamed columns');if(seen.has(id))throw Error(`Duplicate source ID: ${id}`);seen.add(id);
 const hash=createHash('sha256').update(JSON.stringify({raw,map,currency:o.currency||null})).digest('hex');const old=await db.query('select id,source_hash from success.accounts where source_id=$1',[id]);if(old.length){if(old[0].source_hash!==hash)throw Error(`Source ${id} changed; reconcile before importing`);skipped++;continue;}
 const renewal=get('renewal'),arr=get('arr'),cur=get('currency')||o.currency;
 if((renewal||arr||cur)&&!(renewal&&arr&&cur))throw Error(`Account ${id}: renewal date, annual contract value and currency must all be supplied or all omitted`);
 const a=await insert(db,'accounts',{name,owner:get('owner')||'Unassigned',segment:get('segment')||'standard',contact:get('contact'),source_id:id,source_data:JSON.stringify(raw),source_hash:hash});
 if(renewal){date(renewal);const start=new Date(`${renewal}T00:00:00Z`);start.setUTCDate(start.getUTCDate()-365);await insert(db,'contracts',{account_id:a.id,name:`${name} imported annual`,starts_on:start.toISOString().slice(0,10),renews_on:renewal,arr_cents:cents(arr),currency:currency(cur)});}
 inserted++;
 }
 return {inserted,skipped,dry_run:!!o['dry-run']};
}
export async function execute(db,cmd,o={}){
 if(cmd==='help')return Object.entries(specs).map(([command,flags])=>({command,flags:flags.map(f=>`--${f}`).join(' ')}));
 if(reads[cmd])return db.query(reads[cmd]);
 if(cmd==='weekly-review')return {renewals:await db.query(reads['renewals-due']),attention:await db.query(reads.attention),compliance:await db.query(reads.compliance)};
 if(cmd==='qbr')return qbr(db,await resolve(db,'accounts',req(o,'account')));
 if(cmd==='export'){const data={format:'customer-success-v1',exported_at:new Date().toISOString()};await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{for(const name of recordSets)data[name]=await db.query(`select * from success.${name} order by id`);await db.exec('COMMIT');}catch(e){await db.exec('ROLLBACK');throw e;}const out=path.resolve(req(o,'out'));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n',{flag:'wx',mode:0o600});return {file:out,records:recordSets.reduce((n,k)=>n+data[k].length,0)};}
 if(cmd.startsWith('draft-')){const id=await resolve(db,'accounts',req(o,'account'));const data=await qbr(db,id);const dir=path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,`${cmd}-${id}-${Date.now()}.md`);fs.writeFileSync(file,`# Internal ${cmd==='draft-qbr'?'quarterly review':'renewal preparation'} draft\n\nReview before sharing. No renewal commitment is implied.\n\n${human(data)}\n`,{flag:'wx',mode:0o600});return {file};}
 const actor=req(o,'actor');await db.exec('BEGIN');
 try{
 let result;
 const account=async()=>resolve(db,'accounts',req(o,'account'));
 if(cmd==='add-account')result=await insert(db,'accounts',{name:req(o,'name'),owner:req(o,'owner'),segment:o.segment||'standard',contact:o.contact||''});
 else if(cmd==='add-contract')result=await insert(db,'contracts',{account_id:await account(),name:req(o,'name'),starts_on:date(req(o,'start')),renews_on:date(req(o,'renewal')),arr_cents:cents(req(o,'arr')),currency:currency(req(o,'currency'))});
 else if(cmd==='log-touch')result=await insert(db,'touchpoints',{account_id:await account(),name:req(o,'note'),occurred_on:past(req(o,'date')),sentiment:choice(req(o,'sentiment'),['positive','neutral','negative']),actor});
 else if(cmd==='record-usage')result=await insert(db,'usage',{account_id:await account(),name:'Usage observation',observed_on:past(req(o,'date')),active_users:integer(req(o,'active')),licensed_users:integer(req(o,'licensed')),evidence:req(o,'evidence')});
 else if(cmd==='add-action')result=await insert(db,'actions',{account_id:await account(),name:req(o,'name'),owner:req(o,'owner'),due_on:date(req(o,'due'))});
 else if(cmd==='add-objective')result=await insert(db,'objectives',{account_id:await account(),name:req(o,'name'),due_on:date(req(o,'due'))});
 else if(cmd==='finish-action'){const id=await resolve(db,'actions',req(o,'action'));result=(await db.query("update success.actions set status='done',evidence=$2 where id=$1 and status='open' returning *",[id,req(o,'evidence')]))[0];if(!result)throw Error('Action is already complete');}
 else if(cmd==='close-objective'){const id=await resolve(db,'objectives',req(o,'objective'));result=(await db.query("update success.objectives set status=$2,evidence=$3 where id=$1 and status='open' returning *",[id,choice(req(o,'outcome'),['achieved','cancelled']),req(o,'evidence')]))[0];if(!result)throw Error('Objective is already closed');}
 else if(cmd==='review-privacy'){const id=await account();result=(await db.query('update success.accounts set notice_evidence=$2,retention_review_on=$3,security_review_on=$4 where id=$1 returning *',[id,req(o,'notice'),date(req(o,'retention')),date(req(o,'security'))]))[0];}
 else if(cmd==='renewal-decision'){
 const id=await resolve(db,'contracts',req(o,'contract'));const c=(await db.query('select * from success.contracts where id=$1 for update',[id]))[0];if(c.status!=='active')throw Error('Contract already decided');const outcome=choice(req(o,'outcome'),['renewed','churned']);const evidence=req(o,'evidence');if(outcome==='churned'&&(o.arr||o['next-renewal']))throw Error('Churn cannot create a next term');
 await db.query('update success.contracts set status=$2,decided_on=current_date,evidence=$3 where id=$1',[id,outcome,evidence]);
 let next=null;if(outcome==='renewed'){const renewal=date(req(o,'next-renewal'));if(renewal<=c.renews_on)throw Error('Next renewal must follow the existing renewal');next=await insert(db,'contracts',{account_id:c.account_id,name:`${c.name} next term`,starts_on:c.renews_on,renews_on:renewal,arr_cents:cents(req(o,'arr')),currency:c.currency});}result={contract:id,outcome,next_contract:next?.id||null};
 }
 else if(cmd==='import')result=await importTotango(db,o);
 else throw Error(`Unimplemented command ${cmd}`);
 await audit(db,cmd,actor,result);
 await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return result;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
function plain(v){if(v===null||v===undefined)return '';return typeof v==='object'?JSON.stringify(v):String(v);}
export function human(value){if(Array.isArray(value)){if(!value.length)return '(none)';return table(value,Object.keys(value[0]).map(key=>({key,label:key==='arr_cents'?'annual_value':key==='at_risk_arr_cents'?'at_risk_value':key,format:key.endsWith('_cents')?(v)=>v==null?'':(Number(v)/100).toFixed(2):plain,width:key==='reasons'||key==='finding'?100:48})));}if(value&&typeof value==='object'&&Object.values(value).some(Array.isArray))return Object.entries(value).map(([k,v])=>`${k}\n${human(v)}`).join('\n\n');return JSON.stringify(value,null,2);}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{const {cmd,o}=parse(process.argv.slice(2));db=await getDb();const result=await execute(db,cmd,o);console.log(o.json?JSON.stringify(result,null,2):human(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
