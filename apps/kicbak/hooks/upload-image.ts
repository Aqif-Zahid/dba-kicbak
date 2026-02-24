export const uploadImage = async (image: File) => {
  const cloudName = process.env.CLOUD_NAME || "daztrxb2p";
  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", "kicbak");
  formData.append("cloud_name", cloudName);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  return data;
};
