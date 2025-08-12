import { Sparkles } from "lucide-react";
import React from "react";

const WriteArticle = () => {
 return(
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/*left column*/}
      <form className="w-full max-w-lg bg-white rounded-lg border border-gray-200">
<div className="flex items-center gap-3">
    <Sparkles className="w- text-[#4A7AFF]" />
    <h1 className="text-xl font-semibold">Article Configuration</h1>
</div>
      </form>
      {/*right column*/}
    </div>
 )
};

export default WriteArticle;
