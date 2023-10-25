const app = require("express")();
const bodyParser = require("body-parser");
const userRouter = require("./routes/api-user-routes.js");
const meetingRouter = require("./routes/api-meeting-routes.js");

const port = 3000;

app.use(bodyParser.json());

app.use("/api/user", userRouter);
app.use("/api/meeting", meetingRouter);


app.listen(port, ()=>{
    console.log(`http://localhost:${port}`)
})