import { app } from "./server";
const PORT = 8000;
const server = app.listen(PORT, () =>
  console.log("server is running on port " + PORT),
);
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  console.log("Closing http server.");
  server.close((err) => {
    console.log("Http server closed.");
    process.exit(err ? 1 : 0);
  });
});
process.on("SIGINT", () => {
  console.info("SIGINT signal received.");
  console.log("Closing http server.");
  server.close((err) => {
    console.log("Http server closed.");
    process.exit(err ? 1 : 0);
  });
});
