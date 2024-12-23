const express=require('express');
const cors=require('cors')
require('dotenv').config()
const cookieParser=require('cookie-parser')
const jwt = require('jsonwebtoken');
const app=express();
const port=process.env.PORT||5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from this frontend
    credentials: true, // Allow cookies and authentication headers
  }));
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
    const token=req?.cookies?.token
    console.log('This is token',{token})
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' });
    }

    // verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' });
        }
        req.user = decoded;
        next();
    })
}





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ispqqvs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const assignmentDB = client.db("AssignmentDB").collection("assignments");
    const takeassignmentDB = client.db("AssignmentDB").collection("takeassignment");


    app.post('/jwt',async(req,res)=>{
        const user=req.body;
        const token=jwt.sign(user,process.env.JWT_SECRET,{expiresIn:'1h'})
        // console.log('tis is dskdl',token )
        res.cookie('token', token, { httpOnly: true, secure:false });
        res.send({success:true});
    })
    app.post('/logout',(req,res)=>{
        res.clearCookie('token',  { httpOnly: true, secure:false });
        res.send({success:true});
    })

    app.get("/allassignments",async(req,res)=>{
        const cursor = assignmentDB.find({});
        const allValues = await cursor.toArray();
        res.send(allValues)
    })

    app.get("/pendingassignment",verifyToken,async(req,res)=>{
        const cursor = takeassignmentDB.find({});
        const allValues = await cursor.toArray();
        console.log('cookies',req.cookies)

        res.send(allValues)
    })


    app.get("/pendingassignment/:id",verifyToken, async(req,res)=>{
        const id=req.params.id
        // console.log("please delete this user",id)
        const query = { _id: new ObjectId(id) };
        const assignment = await takeassignmentDB.findOne(query);
        res.send(assignment)
        
    })

    app.get("/attemptassignment",verifyToken,async(req,res)=>{
        const cursor = takeassignmentDB.find({});
        const allValues = await cursor.toArray();
        res.send(allValues)
    })

    

    app.get("/assignment/:id",verifyToken, async(req,res)=>{
        const id=req.params.id
        // console.log("please delete this user",id)
        const query = { _id: new ObjectId(id) };
        const user = await assignmentDB.findOne(query);
        res.send(user)
        
    })



    app.post("/addnewassignment",verifyToken,async(req,res)=>{
        const addCampaign =req.body;
        // console.log(addCampaign)
        const result = await assignmentDB.insertOne(addCampaign);
        res.send(result)
    })

    app.post("/takeassignment",verifyToken,async(req,res)=>{
        const assignment =req.body;
        // console.log(addCampaign)
        const result = await takeassignmentDB.insertOne(assignment);
        res.send(result)
    })

    app.put("/update/:id",verifyToken, async(req,res)=>{
        const id=req.params.id
        const user=req.body
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
              title:user.title,
              photo:user.photo,
              type:user.type,
              marks:user.marks,
              description:user.description
            },
          };
        // console.log("please update this user",id,updateuser)
        const result = await assignmentDB.updateOne(filter, updateDoc, options);
        res.send(result)
    })

    app.put("/givemark/:id",verifyToken, async(req,res)=>{
        const id=req.params.id
        const user=req.body
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
              obtainedmarks:user.obtainedmarks,
              feedback:user.feedback,
              status:user.status
            },
          };
        // console.log("please update this user",id,updateuser)
        const result = await takeassignmentDB.updateOne(filter, updateDoc, options);
        res.send(result)
    })

    app.delete("/assignment/:id",async(req,res)=>{
        const id=req.params.id
        console.log("please delete this user",id)
        const query = { _id: new ObjectId(id) };
        const deleteResult = await assignmentDB.deleteOne(query);

        res.send(deleteResult)
        
    })


    // new route

    app.get('/assignments', async (req, res) => {
        try {
            const { type, search } = req.query;

        let query = {};
        if (type) query.type = type;
        if (search) {
            query.title = { $regex: search, $options: "i" }; // Case-insensitive search
        }

        const assignments = await assignmentDB.find(query).toArray();
        res.status(200).send(assignments);
        console.log(assignments)
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error retrieving assignments' });
        }
    });



    
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/",(req,res)=>{
    res.send("Crowdcube server is running")
})

app.listen(port,()=>{
    console.log(`server is running at ${port} `)
})