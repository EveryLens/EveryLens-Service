import { Web3Storage, File } from 'web3.storage';

// Construct with token and endpoint
const client = new Web3Storage({
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE0ZmZlNmQ5QWZGRDgzMzgyRDI1NUYzMDQ3MGI4ZDExMTZGNTA5RjQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Nzk1ODkzMzg0MDUsIm5hbWUiOiJFdmVyeUxlbnMifQ.bQwZwOgwOKicgnTTW43CwrEFUV61PWi-vJrN6s8oSn0',
});

function makeFileObjects(data: object) {
  // You can create File objects from a Buffer of binary data
  // see: https://nodejs.org/api/buffer.html
  // Here we're just storing a JSON object, but you can store images,
  // audio, or whatever you want!
  const buffer = Buffer.from(JSON.stringify(data));

  const files = [
    new File([buffer], 'metadata.json'),
  ];
  return files;
}

export const uploadIpfsGetPath = async (data: object) => {
  const rootCid = await client.put(makeFileObjects(data));
  await client.status(rootCid);
  const res = await client.get(rootCid);
  const files = await res.files();

  return files?.[0]?.cid;
};
