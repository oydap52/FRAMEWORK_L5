const Framework = require("./framework/Application.js");
const Router = require("./framework/Router.js");

const app = new Framework();
const port = 3000;

app.use((req, res) => {
  console.log(`${req.method} ${req.url}`);
});

const userRouter = new Router();

userRouter.get("/users", (req, res) => {
  res.json({ users: [{ id: 1, name: "Ilya" }], query: req.query });
});

userRouter.get("/users/:id", (req, res) => {
  res.json({ id: req.params.id, name: "User" });
});

userRouter.post("/users", (req, res) => {
  res.send(`User created with data: ${JSON.stringify(req.body)}`);
});

userRouter.put("/users/:id", (req, res) => {
  res.json({ message: `User ${req.params.id} updated`, body: req.body });
});

userRouter.patch("/users/:id", (req, res) => {
  res.send(`User ${req.params.id} patched`);
});

userRouter.delete("/users/:id", (req, res) => {
  res.status(200).send(`User ${req.params.id} deleted`);
});

app.addRouter(userRouter);

app.listen(port, () => console.log(`Server started on port ${port}`));