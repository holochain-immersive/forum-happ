const exercise = process.env["EXERCISE"];

if (!exercise || exercise === "1") {
  import("./profile");
}
if (!exercise || exercise === "2") {
  import("./comment");
}
if (!exercise || exercise === "3") {
  import("./post");
}
