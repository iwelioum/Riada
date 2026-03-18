import { Camera } from "lucide-react";

export function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#202224] mb-8">General Settings</h1>

      <div className="bg-white rounded-[14px] border border-[#E0E0E0] p-10 max-w-[1000px]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-[80px] h-[80px] bg-[#F5F6FA] rounded-full flex items-center justify-center mb-3 cursor-pointer hover:bg-[#ebeef5] transition-colors border border-[#E0E0E0]">
            <Camera className="w-6 h-6 text-[#202224]" />
          </div>
          <span className="text-[#4880FF] text-[14px] font-medium cursor-pointer">Upload Logo</span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-[14px] text-[#A6A6A6]">Site Name</label>
            <input 
              type="text" 
              defaultValue="Bright Web"
              className="w-full h-[50px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-[8px] text-[14px] text-[#202224] focus:outline-none focus:ring-1 focus:ring-[#4880FF]"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[14px] text-[#A6A6A6]">Copy Right</label>
            <input 
              type="text" 
              defaultValue="All rights Reserved@brightweb"
              className="w-full h-[50px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-[8px] text-[14px] text-[#202224] focus:outline-none focus:ring-1 focus:ring-[#4880FF]"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[14px] text-[#A6A6A6]">SEO Title</label>
            <input 
              type="text" 
              defaultValue="Bright web is a hybrid dashboard"
              className="w-full h-[50px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-[8px] text-[14px] text-[#202224] focus:outline-none focus:ring-1 focus:ring-[#4880FF]"
            />
          </div>

          <div className="flex flex-col space-y-2 row-span-2">
            <label className="text-[14px] text-[#A6A6A6]">SEO Description</label>
            <textarea 
              defaultValue="Bright web is a hybrid dashboard"
              className="w-full h-full min-h-[130px] p-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-[8px] text-[14px] text-[#202224] focus:outline-none focus:ring-1 focus:ring-[#4880FF] resize-none"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[14px] text-[#A6A6A6]">SEO Keywords</label>
            <input 
              type="text" 
              defaultValue="CEO"
              className="w-full h-[50px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-[8px] text-[14px] text-[#202224] focus:outline-none focus:ring-1 focus:ring-[#4880FF]"
            />
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <button className="w-[200px] h-[50px] bg-[#4880FF] hover:bg-[#3d6de0] text-white font-medium rounded-[8px] transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
