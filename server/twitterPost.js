const twitterPost = async (client, imgString, text = "#Twitter転職") => {
  const media = await client
    .post("media/upload", {
      Name: "resume-image",
      media_data: imgString
    })
    .catch(err => console.log(err));
  const result = await client
    .post("statuses/update", {
      Name: "twitter-tenshoku",
      status: text,
      media_ids: media.media_id_string
    })
    .catch(err => console.log(err));
  return result;
};

module.exports = twitterPost;
