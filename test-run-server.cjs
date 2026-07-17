async function run() {
  const pbRes = await fetch(`http://localhost:3000/api/playback/db4c1708cbb5dd1676284a40f2950aba`);
  const pbData = await pbRes.text();
  console.log(pbData);
}
run();
