/* eslint-disable no-console */
import { Client } from "fnbr";
import prompt from "prompt";

(async () => {
  prompt.start();

  console.log(
    "Visit this link and login, then paste the auth token to generate a device token"
  );
  console.log(
    // "https://www.epicgames.com/id/logout?redirectUrl=https%3A//www.epicgames.com/id/login%3FredirectUrl%3Dhttps%253A%252F%252Fwww.epicgames.com%252Fid%252Fapi%252Fredirect%253FclientId%253D3446cd72694c4a4485d81b77adbb2141%2526responseType%253Dcode",
    "https://www.epicgames.com/id/logout?redirectUrl=https%3A//www.epicgames.com/id/login%3FredirectUrl%3Dhttps%253A%252F%252Fwww.epicgames.com%252Fid%252Fapi%252Fredirect%253FclientId%253D3f69e56c7649492c8cc29f1af08a8a12%2526responseType%253Dcode"
  );

  const { token } = await prompt.get<{ token: string }>(["token"]);

  const client = new Client({ auth: { authorizationCode: token } });

  client.on("deviceauth:created", (da) => {
    console.log("Your auth key is:");
    console.log(Buffer.from(JSON.stringify(da)).toString("base64"));
    process.exit(0);
  });

  await client.login();
})();
