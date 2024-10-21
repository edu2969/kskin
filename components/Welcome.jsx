import Image from "next/image";

export default function Welcome() {
  return (
    <div className="w-full mt-28">
        <div className="w-full relative">
          <div className="flex text-[#A4A5A1]">
            <div className="w-1/2 px-24">
              <div>                
                <div className="ml-32 mt-6 w-[320px]">
                  <img width="180" className="mr-2" src="/simple-logo.png" alt="logo KSkin" />
                  <div className="flex text-3xl ml-5 text-[#EE64C5] space-x-[14px]">
                    <span>K</span>
                    <span>S</span>
                    <span>K</span>
                    <span>I</span>
                    <span>N</span>
                  </div>
                  <p className="text-xs ml-5">KINESIOLOGÍA ESTÉTICA</p>
                </div>               
              </div>
            </div>
            <div className="relative left-20">
              <img src="/skin_care.png" width="300"/>
            </div>
            <div className="absolute top-32 -left-14">
              <img src="/hoja_01.png" width="250"/>
            </div>
            <div className="absolute -right-28 -top-24">
              <img src="/hoja_02.png" width="250"/>
            </div>
          </div>
        </div>
    </div>
  );
}