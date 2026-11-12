const snapshot = require('../snapshot.json');
module.exports = async function(req,res){
  try {
    const response=await fetch('https://fchart.stock.naver.com/sise.nhn?symbol=066970&timeframe=day&count=850&requestType=0',{signal:AbortSignal.timeout(8000),headers:{'User-Agent':'Mozilla/5.0'}});
    if(!response.ok) throw Error('upstream');
    const xml=await response.text();
    const points=[...xml.matchAll(/<item\s+data="([^\"]+)"/g)].map(m=>{const a=m[1].split('|');return {date:`${a[0].slice(0,4)}-${a[0].slice(4,6)}-${a[0].slice(6,8)}`,close:Number(a[4])}}).filter(p=>p.date.length===10&&Number.isFinite(p.close)&&p.close>0);
    if(points.length<2) throw Error('empty');
    res.setHeader('Cache-Control','public, s-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json({points,source:'네이버 금융',isSnapshot:false});
  }catch(e){res.setHeader('Cache-Control','no-store');return res.status(200).json({points:snapshot.points,source:'이전 저장본',isSnapshot:true});}
};
