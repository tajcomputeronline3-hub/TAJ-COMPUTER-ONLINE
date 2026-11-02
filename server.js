require('dotenv').config();
const express=require('express'), session=require('express-session'), helmet=require('helmet');
const bcrypt=require('bcryptjs'), sqlite3=require('sqlite3').verbose(), multer=require('multer');
const path=require('path'), fs=require('fs');
const app=express(), PORT=process.env.PORT||3000;
const dataDir=path.join(__dirname,'data'), uploadDir=path.join(__dirname,'public','uploads');
fs.mkdirSync(dataDir,{recursive:true}); fs.mkdirSync(uploadDir,{recursive:true});
const db=new sqlite3.Database(path.join(dataDir,'taj.sqlite'));
db.serialize(()=>{
 db.run(`CREATE TABLE IF NOT EXISTS services(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,category TEXT NOT NULL,documents TEXT DEFAULT '',benefits TEXT DEFAULT '',image TEXT DEFAULT '',active INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
 db.run(`CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY,username TEXT UNIQUE,password_hash TEXT NOT NULL)`);
 db.get('SELECT id FROM admins LIMIT 1',(e,row)=>{
  if(!row){const user=process.env.ADMIN_USERNAME||'admin', pass=process.env.ADMIN_PASSWORD||'ChangeThisPassword123!';
   bcrypt.hash(pass,12,(err,hash)=>{if(!err)db.run('INSERT INTO admins(username,password_hash) VALUES(?,?)',[user,hash]);});
  }
 });
 db.get('SELECT COUNT(*) n FROM services',(e,r)=>{if(!e&&r.n===0){
  const seed=[
   ['पैन कार्ड','कार्ड एवं पहचान पत्र','आधार कार्ड, मोबाइल नंबर, जन्मतिथि प्रमाण','नया पैन, सुधार और रीप्रिंट'],
   ['आयुष्मान कार्ड','कार्ड एवं पहचान पत्र','आधार कार्ड, समग्र ID, राशन कार्ड','पात्र परिवारों के लिए स्वास्थ्य योजना कार्ड'],
   ['वोटर कार्ड','कार्ड एवं पहचान पत्र','आधार कार्ड, फोटो, मोबाइल नंबर','नया आवेदन और विवरण में सुधार'],
   ['ई-श्रम कार्ड','कार्ड एवं पहचान पत्र','आधार कार्ड, आधार से लिंक मोबाइल','असंगठित श्रमिक पंजीयन'],
   ['संबल कार्ड','कार्ड एवं पहचान पत्र','समग्र ID, आधार कार्ड','संबल योजना पंजीयन/अपडेट'],
   ['पासपोर्ट आवेदन','लाइसेंस एवं आवेदन','आधार कार्ड, जन्मतिथि प्रमाण, मोबाइल, ईमेल','नया पासपोर्ट, नवीनीकरण और सुधार'],
   ['ड्राइविंग लाइसेंस','लाइसेंस एवं आवेदन','आधार कार्ड, फोटो, मोबाइल नंबर','लर्नर/स्थायी लाइसेंस आवेदन में सहायता'],
   ['उद्यम रजिस्ट्रेशन','रजिस्ट्रेशन','आधार, PAN, व्यवसाय की जानकारी','MSME उद्यम पंजीयन'],
   ['फूड लाइसेंस (FSSAI)','लाइसेंस एवं आवेदन','आधार/PAN, फोटो, व्यवसाय/पते का विवरण','खाद्य व्यवसाय लाइसेंस आवेदन'],
   ['स्कॉलरशिप फॉर्म','फॉर्म एवं शिक्षा','आधार, समग्र ID, मार्कशीट, बैंक पासबुक','विभिन्न छात्रवृत्ति आवेदन'],
   ['MPESB / व्यापम फॉर्म','फॉर्म एवं शिक्षा','फोटो, हस्ताक्षर, शैक्षणिक दस्तावेज','प्रतियोगी परीक्षा आवेदन'],
   ['स्कूल संबंधित कार्य','स्कूल सेवाएँ','स्कूल द्वारा उपलब्ध कराई गई जानकारी','मैपिंग, स्टूडेंट प्रोफाइल, U-DISE, टाइपिंग'],
   ['आयकर रिटर्न (ITR)','टैक्स एवं वित्त','PAN, आधार, बैंक विवरण, आय/खर्च के दस्तावेज','आयकर रिटर्न भरने में सहायता'],
   ['फोटो, प्रिंट एवं लैमिनेशन','प्रिंटिंग एवं फोटो','प्रिंट हेतु डिजिटल फाइल/फोटो','फोटो प्रिंट, स्कैन, फोटोकॉपी और लैमिनेशन']
  ];
  const st=db.prepare('INSERT INTO services(name,category,documents,benefits) VALUES(?,?,?,?)');
  seed.forEach(x=>st.run(x)); st.finalize();
 }});
});
app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:'2mb'})); app.use(express.urlencoded({extended:true}));
app.use(session({secret:process.env.SESSION_SECRET||'replace-this-secret',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:8*60*60*1000}}));
app.use(express.static(path.join(__dirname,'public')));
const storage=multer.diskStorage({destination:(req,file,cb)=>cb(null,uploadDir),filename:(req,file,cb)=>cb(null,Date.now()+'-'+Math.random().toString(36).slice(2)+path.extname(file.originalname).toLowerCase())});
const upload=multer({storage,limits:{fileSize:3*1024*1024},fileFilter:(req,file,cb)=>cb(null,/^image\/(jpeg|png|webp)$/.test(file.mimetype))});
const auth=(req,res,next)=>req.session.admin?next():res.status(401).json({error:'कृपया पहले Admin Login करें।'});
app.get('/api/services',(req,res)=>db.all('SELECT id,name,category,documents,benefits,image FROM services WHERE active=1 ORDER BY category,name',(e,rows)=>e?res.status(500).json({error:'डेटाबेस त्रुटि'}):res.json(rows)));
app.get('/api/stats',(req,res)=>db.get('SELECT COUNT(*) count FROM services WHERE active=1',(e,r)=>res.json({shop:'TAJ COMPUTER ONLINE, KHATEGAON',services:r?.count||0})));
app.post('/api/admin/login',(req,res)=>{const {username,password}=req.body;db.get('SELECT * FROM admins WHERE username=?',[username],(e,row)=>{if(!row||!bcrypt.compareSync(password||'',row.password_hash))return res.status(401).json({error:'यूज़रनेम या पासवर्ड गलत है।'});req.session.admin={id:row.id,username:row.username};res.json({ok:true});});});
app.post('/api/admin/logout',auth,(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get('/api/admin/me',(req,res)=>res.json({loggedIn:!!req.session.admin,username:req.session.admin?.username||''}));
app.get('/api/admin/services',auth,(req,res)=>db.all('SELECT * FROM services ORDER BY id DESC',(e,rows)=>res.json(rows||[])));
app.post('/api/admin/services',auth,upload.single('image'),(req,res)=>{
 const {name,category,documents,benefits}=req.body;if(!name||!category)return res.status(400).json({error:'सेवा का नाम और श्रेणी जरूरी है।'});
 db.run('INSERT INTO services(name,category,documents,benefits,image) VALUES(?,?,?,?,?)',[name,category,documents||'',benefits||'',req.file?'/uploads/'+req.file.filename:''],function(e){e?res.status(500).json({error:'सेवा सेव नहीं हुई'}):res.json({ok:true,id:this.lastID});});
});
app.put('/api/admin/services/:id',auth,upload.single('image'),(req,res)=>{
 const {name,category,documents,benefits,active}=req.body;
 const sql='UPDATE services SET name=?,category=?,documents=?,benefits=?,active=?'+(req.file?',image=?':'')+' WHERE id=?';
 const vals=[name,category,documents||'',benefits||'',active==='0'?0:1];if(req.file)vals.push('/uploads/'+req.file.filename);vals.push(req.params.id);
 db.run(sql,vals,function(e){e?res.status(500).json({error:'अपडेट नहीं हुआ'}):res.json({ok:true});});
});
app.delete('/api/admin/services/:id',auth,(req,res)=>db.run('DELETE FROM services WHERE id=?',[req.params.id],e=>e?res.status(500).json({error:'हटाया नहीं गया'}):res.json({ok:true})));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log('TAJ website running on port '+PORT));