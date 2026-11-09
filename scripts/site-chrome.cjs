// Shared build-time HTML, also committed into source pages for plain static servers/no JavaScript.
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..'),pages=require('../config/site-pages.json');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').trim();
function render(html,page){
 if(!pages.standard.includes(page))return html;
 for(const part of ['header','footer']){
  const start=`<!-- site-${part}:start -->`,end=`<!-- site-${part}:end -->`;
  const fragment=read(`partials/site-${part}.html`),replacement=`${start}\n${fragment}\n${end}`;
  if(html.includes(start))html=html.slice(0,html.indexOf(start))+replacement+html.slice(html.indexOf(end)+end.length);
  else {
   const re=new RegExp(`<${part}\\b[^>]*>[\\s\\S]*?<\\/${part}>`,'i');
   if(re.test(html))html=html.replace(re,replacement);
   else html=part==='header'?html.replace(/<main\b/i,replacement+'\n<main'):html.replace(/<\/body>/i,replacement+'\n</body>');
  }
 }
 html=html.replace(/<div class="shell review-links">[\s\S]*?<\/div>/g,'');
 if(!html.includes('src="/assets/js/site-experience.js"'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/site-experience.css">\n<script defer src="/assets/js/site-experience.js"></script>\n</head>');
 if(!html.includes('data-chrome-nojs'))html=html.replace('</head>','<noscript data-chrome-nojs><style>html .experience-header .chrome-menu[hidden]{display:none!important}html .experience-header .chrome-menu[aria-expanded="false"]+.primary-navigation{display:flex!important}</style></noscript>\n</head>');
 html=html.replace(/<body([^>]*)class="([^"]*)"/,'<body$1class="$2 experience-standard"').replace(/experience-standard(?:\s+experience-standard)+/g,'experience-standard');
 return html;
}
module.exports={render,pages};
