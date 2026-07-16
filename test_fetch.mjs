import fs from "fs";

async function run() {
  const url = "https://jellyfin-jacklumber00.siren.mygiga.cloud";
  const apiKey = "a2aac09e434e4bcc897c1b181ca197eb";

  console.time("Fetch Users");
  const usersResp = await fetch(`${url}/Users?api_key=${apiKey}`);
  const usersData = await usersResp.json();
  const userId = usersData[0]?.Id;
  console.timeEnd("Fetch Users");

  console.log("User ID:", userId);

  console.time("Fetch Movies");
  const libraryUrl = userId 
    ? `${url}/Users/${userId}/Items?recursive=true&includeItemTypes=Movie,Series&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios&limit=3000&api_key=${apiKey}`
    : `${url}/Items?recursive=true&includeItemTypes=Movie,Series&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios&limit=3000&api_key=${apiKey}`;
  
  const response = await fetch(libraryUrl);
  const data = await response.json();
  console.timeEnd("Fetch Movies");

  console.log("Total items returned:", data.Items?.length);
}

run().catch(console.error);
