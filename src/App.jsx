import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WriteArticle from "./pages/WriteArticle";
import RemoveObject from "./pages/RemoveObject";
import RemoveBackground from "./pages/RemoveBackground";
import GenerateImages from "./pages/GenerateImages";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import BlogTitles from "./pages/BlogTitles";
import Layout from "./pages/Layout";
import ReviewResume from "./pages/ReviewResume";

const App = () => {
  return(
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/ai' element={<Layout />} >
        <Route index element={<Dashboard />} />
        <Route path='write-article' element={<WriteArticle />} />
        <Route path='remove-object' element={<RemoveObject />} />
        <Route path='remove-background' element={<RemoveBackground />} />
        <Route path='generate-images' element={<GenerateImages />} />
        <Route path='review-resume' element={<ReviewResume />} />
        <Route path='community' element={<Community />} />
        <Route path='blog-titles' element={<BlogTitles />} />
    </Route>
      </Routes>
    </div>
  )
};

export default App;
