import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import 'dotenv/config';
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'

const AI = new OpenAI({ //copy from google ai studio->openai
  apiKey: process.env.GEMINI_API_KEY, 
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

{/*----------------Generate Article----------------------- */}
export const generateArticle = async (req, res) => {
  try {
  const { userId } = await req.auth();
  console.log(userId);
  const {prompt,length} = req.body;
  console.log(prompt,length);
  const plan = req.plan;
  const free_usage = req.free_usage

  if (plan !== "premium" && free_usage >= 10) {
      return res.status(402).json({success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: parseInt(length),
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error("No content generated");
    }
    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    } return res.json({success: true,content });

  } catch (error) {
    console.error("Article generation error:", error);
    res.status(500).json({success: false, message: error.message || "Failed to generate article"});
  }
};

{/*----------------Generate Blog Title----------------------- */}
export const generateBlogTitle = async (req, res) => {
  try {
  const { userId } = await req.auth();
  console.log(userId);
  const {prompt} = req.body;
  console.log(prompt);
  const plan = req.plan;
  const free_usage = req.free_usage

  if (plan !== "premium" && free_usage >= 10) {
      return res.status(402).json({success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error("No content generated");
    }
    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    } return res.json({success: true,content });

  } catch (error) {
    console.error("Blog Title generation error:", error);
    res.status(500).json({success: false, message: error.message || "Failed to generate Blog Title"});
  }
};

{/*----------------Generate Image----------------------- */}
export const generateImage = async (req, res) => {
  try {
    const { userId } =  req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(402).json({success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    };

const formData = new FormData()
formData.append('prompt', prompt);
const { data } = await axios.post('https://clipdrop-api.co/text-to-image/v1',formData,{headers: {
'x-api-key': process.env.CLIPDROP_API_KEY,},
responseType: 'arraybuffer',});

    const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    return res.json({ success: true, content: secure_url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

{/*----------------Remove Image Background----------------------- */}
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } =  req.auth();
    const {image} = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(402).json({success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    };


    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation:[{
        effect: "background_emoval",
        background_removal:'remove_the_background',
      }
    ]
    })

    await sql`INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId},'Remove background from image', ${prompt}, ${secure_url}, 'image')`;

    return res.json({ success: true, content: secure_url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

{/*----------------Remove Image Object----------------------- */}
export const removeImageObject = async (req, res) => {
  try {
    const { userId } =  req.auth();
    const { object } =  req.body;
    const {image} = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(402).json({success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    };

    const { public_id } = await cloudinary.uploader.upload(image.path)
    const imageUrl = cloudinary.url(public_id, {
      transformation:[
        {
          effect:`gen_remove:${object}`,
        }
      ],
      resource_type:'image'
    })

    await sql`INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId},${`Remove ${object} from image`}, ${imageUrl}, 'image'})`;

    return res.json({ success: true, content: imageUrl });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

{/*----------------Resume Review----------------------- */}
export const resumeReview = async (req, res) => {
  try {
    const { userId } =  req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(402).json({success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    };

if(resume.size>5*1024*1024){
  return res.status(402).json({success: false,
    message: "File size is too large. Allowed size is 5MB.",
  });
}
const dataBuffer=fs.readFileSync(resume.path)
const pdfData=await pdf(dataBuffer);

const prompt=`Review the following resume and provide constructive feedback on its strengths, weaknesses, and area for improvement.Resume Content:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens:1000,
    });
        const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId},'Review the uploaded resume, ${content}, 'resume-review'})`;

    return res.json({ success: true, content: content });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};