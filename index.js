const express=require('express');
const cors=require('cors')
require('dotenv').config()
const app=express();
const port=process.env.PORT||5000;
const { MongoClient, ServerApiVersion } = require('mongodb');


app.use(cors());
app.use(express.json());





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

    app.get("/allassignments",async(req,res)=>{
        const cursor = assignmentDB.find({});
        const allValues = await cursor.toArray();
        res.send(allValues)
    })

    app.post("/addnewassignment",async(req,res)=>{
        const addCampaign =req.body;
        // console.log(addCampaign)
        const result = await assignmentDB.insertOne(addCampaign);
        res.send(result)
    })
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