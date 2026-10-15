import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = fs.readFileSync('src/lib/analytics.ts','utf8').replace('import.meta.env.PUBLIC_GA4_ID', '"G-TEST123"');
const compiled = ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
function simulate({choice='yes',gpc=false,pathname='/',hostname='jeehoonju.com'}={}) {
 const appended=[]; const window={addEventListener(){}};
 const document={title:'Specific treatment title',referrer:'https://example.com/private-query?q=secret',querySelector:()=>({hidden:true}),querySelectorAll:()=>[],createElement:()=>({}),head:{append:x=>appended.push(x)},addEventListener(){},documentElement:{scrollHeight:1000},visibilityState:'visible',hasFocus:()=>true};
 vm.runInNewContext(compiled,{window,document,location:{hostname,pathname},navigator:{globalPrivacyControl:gpc},localStorage:{getItem:()=>choice},setInterval(){},URL,Date,Set,innerHeight:500,scrollY:0});
 return {appended,events:(window.dataLayer||[]).map(x=>Array.from(x))};
}
test('analytics never loads without consent, with GPC, on forms or preview hosts',()=>{
 for(const options of [{choice:null},{choice:'no'},{gpc:true},{pathname:'/book/'},{pathname:'/book/received/'},{pathname:'/building/'},{hostname:'localhost'}]){
 const result=simulate(options);assert.equal(result.appended.length,0,JSON.stringify(options));assert.equal(result.events.length,0);
 }
});
test('care topics and titles are grouped and referrer/query details are absent',()=>{
 for(const pathname of ['/care/treatments/ultherapy/','/care/concerns/acne-scarring/','/care/programs/the-restoration/']){
 const result=simulate({pathname});assert.equal(result.appended.length,1);
 const config=result.events.find(x=>x[0]==='config')[2];const event=result.events.find(x=>x[0]==='event')[2];
 for(const value of [config,event]){assert.equal(value.page_location,'https://jeehoonju.com/care/');assert.equal(value.page_title,'Care library');assert.equal(value.page_referrer,'https://example.com');}
 assert.equal(config.send_page_view,false);assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false);
 }
});
