import svgPaths from "./svg-35pza6f0nq";
import imgImageDePersonnage15Juil202561 from "figma:asset/56009acc4775511c72515738c37943ab8b5d23dc.png";
import imgLogo from "figma:asset/ad7ebb5a47c9e71a62cea185572330b900fec16d.png";
import imgLogo1 from "figma:asset/ad98566b766c90cfba4de22bba625d8a4e2866a0.png";
import imgLogo2 from "figma:asset/d893b0146aefe2e659ca4a5ad22f085036aa98cd.png";
import imgLogo3 from "figma:asset/4593092b4e160a253e8e25c436b87ac0cf0b0d0e.png";
import imgLogo4 from "figma:asset/5b13f362bb154c37122372b5035a567d25a56634.png";
import imgImage from "figma:asset/f740ec4399b8ddafb102a3303b7b3f3312f0a00c.png";
import img1stLineForms1 from "figma:asset/921069a3d9f1bd5cf4c380bd19790ab8b801e1a1.png";
import { imgGroup } from "./svg-5xsdg";

function Group3() {
  return (
    <div className="absolute h-[958px] left-[calc(50%-10.5px)] top-[calc(50%-2px)] translate-x-[-50%] translate-y-[-50%] w-[1685px]">
      <div className="absolute inset-[-22.34%_-12.7%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2113 1386">
          <g id="Group 4">
            <g filter="url(#filter0_f_213_1457)" id="Ellipse 6">
              <ellipse cx="1032.5" cy="693" fill="url(#paint0_linear_213_1457)" fillOpacity="0.2" rx="818.5" ry="479" />
            </g>
            <g filter="url(#filter1_f_213_1457)" id="Ellipse 7">
              <ellipse cx="1056.5" cy="693" fill="url(#paint1_linear_213_1457)" fillOpacity="0.2" rx="842.5" ry="479" transform="rotate(-180 1056.5 693)" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1386" id="filter0_f_213_1457" width="2065" x="7.62939e-05" y="5.78199e-06">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_213_1457" stdDeviation="107" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1386" id="filter1_f_213_1457" width="2113" x="-3.90087e-06" y="9.4193e-05">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_213_1457" stdDeviation="107" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_213_1457" x1="-190.058" x2="3193.24" y1="214" y2="-487.211">
              <stop offset="0.0807757" stopColor="#474EFF" />
              <stop offset="0.32177" stopColor="#B066FF" />
              <stop offset="0.58331" stopColor="#E884C0" />
              <stop offset="0.904066" stopColor="#FFE366" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_213_1457" x1="-1027.5" x2="3170.21" y1="83.0003" y2="-871.928">
              <stop offset="0.0807757" stopColor="#474EFF" />
              <stop offset="0.32177" stopColor="#B066FF" />
              <stop offset="0.58331" stopColor="#E884C0" />
              <stop offset="0.904066" stopColor="#FFE366" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function TextBlock() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[9.094px] items-start left-[44.43px] not-italic text-[#1e0e62] top-[calc(50%+0.29px)] translate-y-[-50%] w-[340px]" data-name="Text Block">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] min-w-full relative shrink-0 text-[23.385px] w-[min-content]">
        {`Des assistants experts `}
        <br aria-hidden="true" />
        qui vous connaissent
      </p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] opacity-70 relative shrink-0 text-[20.786px] w-[396px]">
        {`Bénéficiez d’assistants qui comprennent votre contexte et s’adaptent à `}
        <br aria-hidden="true" />
        votre façon de travailler.
      </p>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents right-[-8.75px] top-[8.43px]">
      <div className="absolute right-[-8.75px] size-[214.359px] top-[8.43px]" data-name="Image de personnage 15 juil 2025 (6) 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[137.26%] left-[4.25%] max-w-none top-[-16.79%] w-[91.5%]" src={imgImageDePersonnage15Juil202561} />
        </div>
      </div>
      <div className="absolute h-[24.545px] right-[88.52px] top-[180.43px] w-[31.09px]" data-name="Icon" />
    </div>
  );
}

function ImageContainer() {
  return (
    <div className="absolute contents right-[-8.75px] top-[8.43px]" data-name="Image Container">
      <Group2 />
    </div>
  );
}

function ImageContainer1() {
  return (
    <div className="absolute contents right-[-8.75px] top-[8.43px]" data-name="Image Container">
      <ImageContainer />
    </div>
  );
}

function Container() {
  return (
    <div className="backdrop-blur-[61.06px] backdrop-filter bg-white h-[214.359px] overflow-clip relative rounded-[15.59px] shrink-0 w-full" data-name="Container">
      <TextBlock />
      <div className="absolute flex h-[calc(1px*((var(--transform-inner-width)*0.05983332544565201)+(var(--transform-inner-height)*0.9982084631919861)))] items-center justify-center left-[461.43px] top-[calc(50%+11.33px)] translate-y-[-50%] w-[calc(1px*((var(--transform-inner-height)*0.05983332544565201)+(var(--transform-inner-width)*0.9982084631919861)))]" style={{ "--transform-inner-width": "610.140625", "--transform-inner-height": "450.453125" } as React.CSSProperties}>
        <div className="flex-none rotate-[183.43deg]">
          <div className="h-[450.464px] relative w-[610.143px]">
            <div className="absolute inset-[-21.8%_-16.09%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 807 647">
                <g filter="url(#filter0_fn_213_1465)" id="Ellipse 2" opacity="0.36">
                  <ellipse cx="403.271" cy="323.432" fill="url(#paint0_linear_213_1465)" fillOpacity="0.4" rx="305.071" ry="225.232" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="646.865" id="filter0_fn_213_1465" width="806.543" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feGaussianBlur result="effect1_foregroundBlur_213_1465" stdDeviation="49.1001" />
                    <feTurbulence baseFrequency="inf inf" numOctaves="3" result="noise" seed="3096" stitchTiles="stitch" type="fractalNoise" />
                    <feColorMatrix in="noise" result="alphaNoise" type="luminanceToAlpha" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                      <feFuncA tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " type="discrete" />
                    </feComponentTransfer>
                    <feComposite in="coloredNoise1" in2="effect1_foregroundBlur_213_1465" operator="in" result="noise1Clipped" />
                    <feFlood floodColor="#000000" result="color1Flood" />
                    <feComposite in="color1Flood" in2="noise1Clipped" operator="in" result="color1" />
                    <feMerge result="effect2_noise_213_1465">
                      <feMergeNode in="effect1_foregroundBlur_213_1465" />
                      <feMergeNode in="color1" />
                    </feMerge>
                  </filter>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_213_1465" x1="868.316" x2="766.377" y1="-273.152" y2="749.602">
                    <stop offset="0.442065" stopColor="#F72024" />
                    <stop offset="0.904066" stopColor="#F06E35" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <ImageContainer1 />
    </div>
  );
}

function TextBlock1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[9.094px] items-start left-[44.17px] not-italic text-[#1e0e62] top-[calc(50%+0.15px)] translate-y-[-50%]" data-name="Text Block">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[23.385px] text-nowrap whitespace-pre">{`L’IA au coeur de vos outils `}</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] opacity-70 relative shrink-0 text-[20.786px] w-[349.47px]">Profitez de la GenAI directement dans vos applications pour gagner en efficacité au quotidien.</p>
    </div>
  );
}

function Pictos() {
  return (
    <div className="relative shrink-0 size-[21.067px]" data-name="Pictos">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Pictos">
          <path d={svgPaths.p2b69cd80} fill="var(--fill-0, #1E0E62)" id="Vector" />
          <path d={svgPaths.pb297a0} fill="var(--fill-0, #1E0E62)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function OutilSelection() {
  return (
    <div className="bg-[#e9e5ff] box-border content-stretch flex gap-[5.267px] items-center p-[5.267px] relative rounded-[5.267px] shrink-0 w-[239.633px]" data-name="Outil_Selection">
      <Pictos />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#1e0e62] text-[15.8px] text-nowrap">
        <p className="leading-[1.3] whitespace-pre">Améliorer</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[5.267px] items-start relative shrink-0 w-full">
      <OutilSelection />
    </div>
  );
}

function Pictos1() {
  return (
    <div className="relative shrink-0 size-[21.067px]" data-name="Pictos">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Pictos">
          <path d={svgPaths.pfbf5d80} fill="var(--fill-0, #1E0E62)" id="Vector" />
          <path d={svgPaths.p32410a00} fill="var(--fill-0, #1E0E62)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function OutilSelection1() {
  return (
    <div className="box-border content-stretch flex gap-[5.267px] items-center p-[5.267px] relative rounded-[5.267px] shrink-0 w-[239.633px]" data-name="Outil_Selection">
      <Pictos1 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1e0e62] text-[15.8px] text-nowrap">
        <p className="leading-[1.3] whitespace-pre">Traduire</p>
      </div>
    </div>
  );
}

function Pictos2() {
  return (
    <div className="relative shrink-0 size-[21.067px]" data-name="Pictos">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Pictos">
          <path d="M4.21327 4.21359H7.37327" id="Icon" stroke="var(--stroke-0, #1E0E62)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.31667" />
          <path d={svgPaths.p3775df80} id="Icon_2" stroke="var(--stroke-0, #1E0E62)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.31667" />
          <path d={svgPaths.p231b9300} fill="var(--fill-0, #1E0E62)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function OutilSelection2() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[5.267px] items-center p-[5.267px] relative rounded-[5.267px] shrink-0 w-[239.633px]" data-name="Outil_Selection">
      <Pictos2 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1e0e62] text-[15.8px] text-nowrap">
        <p className="leading-[1.3] whitespace-pre">Remplacer</p>
      </div>
    </div>
  );
}

function Pictos3() {
  return (
    <div className="relative shrink-0 size-[21.067px]" data-name="Pictos">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Pictos">
          <g id="Vector">
            <path d={svgPaths.p19e9c700} fill="var(--fill-0, #1E0E62)" />
            <path d={svgPaths.p7723500} fill="var(--fill-0, #1E0E62)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function OutilSelection3() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[5.267px] items-center p-[5.267px] relative rounded-[5.267px] shrink-0 w-[239.633px]" data-name="Outil_Selection">
      <Pictos3 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1e0e62] text-[15.8px] text-nowrap">
        <p className="leading-[1.3] whitespace-pre">Résumer</p>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[5.267px] items-start relative shrink-0 w-full">
      <Frame2 />
      <OutilSelection1 />
      <OutilSelection2 />
      <OutilSelection3 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[13.167px] items-start relative shrink-0 w-full">
      <Frame4 />
    </div>
  );
}

function Pictos4() {
  return (
    <div className="relative shrink-0 size-[21.067px]" data-name="Pictos">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Pictos">
          <path d={svgPaths.p2b69cd80} fill="var(--fill-0, #1E0E62)" id="Vector" />
          <path d={svgPaths.pb297a0} fill="var(--fill-0, #1E0E62)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function OutilSelection4() {
  return (
    <div className="bg-[#e9e5ff] box-border content-stretch flex gap-[5.267px] items-center opacity-0 p-[5.267px] relative rounded-[5.267px] shrink-0 w-[239.633px]" data-name="Outil_Selection">
      <Pictos4 />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#1e0e62] text-[15.8px] text-nowrap">
        <p className="leading-[1.3] whitespace-pre">Améliorer</p>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[5.267px] items-start relative shrink-0 w-full">
      <OutilSelection4 />
    </div>
  );
}

function Pictos5() {
  return (
    <div className="relative shrink-0 size-[21.067px]" data-name="Pictos">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Pictos">
          <path d={svgPaths.pfbf5d80} fill="var(--fill-0, #1E0E62)" id="Vector" />
          <path d={svgPaths.p32410a00} fill="var(--fill-0, #1E0E62)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function OutilSelection5() {
  return (
    <div className="box-border content-stretch flex gap-[5.267px] items-center p-[5.267px] relative rounded-[5.267px] shrink-0 w-[239.633px]" data-name="Outil_Selection">
      <Pictos5 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1e0e62] text-[15.8px] text-nowrap">
        <p className="leading-[1.3] whitespace-pre">Traduire</p>
      </div>
    </div>
  );
}

function Pictos6() {
  return (
    <div className="relative shrink-0 size-[21.067px]" data-name="Pictos">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Pictos">
          <path d="M4.21327 4.21359H7.37327" id="Icon" stroke="var(--stroke-0, #1E0E62)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.31667" />
          <path d={svgPaths.p3775df80} id="Icon_2" stroke="var(--stroke-0, #1E0E62)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.31667" />
          <path d={svgPaths.p231b9300} fill="var(--fill-0, #1E0E62)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function OutilSelection6() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[5.267px] items-center p-[5.267px] relative rounded-[5.267px] shrink-0 w-[239.633px]" data-name="Outil_Selection">
      <Pictos6 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1e0e62] text-[15.8px] text-nowrap">
        <p className="leading-[1.3] whitespace-pre">Remplacer</p>
      </div>
    </div>
  );
}

function Pictos7() {
  return (
    <div className="relative shrink-0 size-[21.067px]" data-name="Pictos">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Pictos">
          <g id="Vector">
            <path d={svgPaths.p19e9c700} fill="var(--fill-0, #1E0E62)" />
            <path d={svgPaths.p7723500} fill="var(--fill-0, #1E0E62)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function OutilSelection7() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[5.267px] items-center p-[5.267px] relative rounded-[5.267px] shrink-0 w-[239.633px]" data-name="Outil_Selection">
      <Pictos7 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1e0e62] text-[15.8px] text-nowrap">
        <p className="leading-[1.3] whitespace-pre">Résumer</p>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[5.267px] items-start relative shrink-0 w-full">
      <Frame3 />
      <OutilSelection5 />
      <OutilSelection6 />
      <OutilSelection7 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[13.167px] items-start relative shrink-0 w-full">
      <Frame5 />
    </div>
  );
}

function OutilsMenu() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[10.533px] items-start left-[420.61px] p-[10.533px] rounded-[5.267px] shadow-[0px_2.633px_13.167px_0px_rgba(147,154,170,0.25)] top-[45.43px] w-[260.7px]" data-name="Outils_menu">
      <Frame />
      <Frame1 />
    </div>
  );
}

function Gestisoft() {
  return (
    <div className="absolute bg-white box-border content-stretch flex gap-[15.18px] items-center justify-center left-[642.04px] p-[7.59px] rounded-[1895.59px] size-[60.72px] top-[8.16px]" data-name="Gestisoft">
      <div aria-hidden="true" className="absolute border-[#ebeaed] border-[2.104px] border-solid inset-0 pointer-events-none rounded-[1895.59px]" />
      <div className="relative shrink-0 size-[35.42px]" data-name="Logo">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgLogo} />
      </div>
    </div>
  );
}

function Gestisoft1() {
  return (
    <div className="absolute bg-white box-border content-stretch flex gap-[12.096px] items-center justify-center left-[593.65px] p-[6.048px] rounded-[1510.5px] size-[48.384px] top-[3.28px]" data-name="Gestisoft">
      <div aria-hidden="true" className="absolute border-[#ebeaed] border-[2.104px] border-solid inset-0 pointer-events-none rounded-[1510.5px]" />
      <div className="relative shrink-0 size-[28.224px]" data-name="Logo">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgLogo1} />
      </div>
    </div>
  );
}

function Gestisoft2() {
  return (
    <div className="absolute bg-white box-border content-stretch flex gap-[15.725px] items-center justify-center left-[597.86px] p-[7.862px] rounded-[1963.65px] size-[62.9px] top-[53.39px]" data-name="Gestisoft">
      <div aria-hidden="true" className="absolute border-[#ebeaed] border-[2.104px] border-solid inset-0 pointer-events-none rounded-[1963.65px]" />
      <div className="relative shrink-0 size-[36.692px]" data-name="Logo">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgLogo2} />
      </div>
    </div>
  );
}

function Gestisoft3() {
  return (
    <div className="absolute bg-white box-border content-stretch flex gap-[10.518px] items-center justify-center left-[664.13px] p-[5.259px] rounded-[1313.48px] size-[42.073px] top-[70.11px]" data-name="Gestisoft">
      <div aria-hidden="true" className="absolute border-[#ebeaed] border-[2.104px] border-solid inset-0 pointer-events-none rounded-[1313.48px]" />
      <div className="relative shrink-0 size-[24.543px]" data-name="Logo">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgLogo3} />
      </div>
    </div>
  );
}

function Gestisoft4() {
  return (
    <div className="absolute bg-white box-border content-stretch flex gap-[21.3px] items-center justify-center left-[621px] p-[10.65px] rounded-[2659.8px] size-[85.199px] top-[108.08px]" data-name="Gestisoft">
      <div aria-hidden="true" className="absolute border-[#ebeaed] border-[2.104px] border-solid inset-0 pointer-events-none rounded-[2659.8px]" />
      <div className="relative shrink-0 size-[49.699px]" data-name="Logo">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-contain pointer-events-none size-full" src={imgLogo4} />
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[593.65px] top-[3.28px]">
      <Gestisoft />
      <Gestisoft1 />
      <Gestisoft2 />
      <Gestisoft3 />
      <Gestisoft4 />
    </div>
  );
}

function Container1() {
  return (
    <div className="backdrop-blur-[61.06px] backdrop-filter bg-white h-[214.359px] overflow-clip relative rounded-[15.59px] shrink-0 w-full" data-name="Container">
      <div className="absolute flex h-[calc(1px*((var(--transform-inner-width)*0.9873713850975037)+(var(--transform-inner-height)*0.15842276811599731)))] items-center justify-center left-[244.01px] top-[calc(50%+34.29px)] translate-y-[-50%] w-[calc(1px*((var(--transform-inner-height)*0.9873713850975037)+(var(--transform-inner-width)*0.15842276811599731)))]" style={{ "--transform-inner-width": "297.78125", "--transform-inner-height": "573.65625" } as React.CSSProperties}>
        <div className="flex-none rotate-[99.115deg]">
          <div className="h-[573.667px] relative w-[297.79px]">
            <div className="absolute inset-[-33.1%_-63.76%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 678 954">
                <g filter="url(#filter0_fn_213_1463)" id="Ellipse 2" opacity="0.56">
                  <ellipse cx="338.778" cy="476.717" fill="url(#paint0_linear_213_1463)" fillOpacity="0.4" rx="148.895" ry="286.833" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="953.433" id="filter0_fn_213_1463" width="677.556" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feGaussianBlur result="effect1_foregroundBlur_213_1463" stdDeviation="94.9415" />
                    <feTurbulence baseFrequency="inf inf" numOctaves="3" result="noise" seed="3096" stitchTiles="stitch" type="fractalNoise" />
                    <feColorMatrix in="noise" result="alphaNoise" type="luminanceToAlpha" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                      <feFuncA tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " type="discrete" />
                    </feComponentTransfer>
                    <feComposite in="coloredNoise1" in2="effect1_foregroundBlur_213_1463" operator="in" result="noise1Clipped" />
                    <feFlood floodColor="#000000" result="color1Flood" />
                    <feComposite in="color1Flood" in2="noise1Clipped" operator="in" result="color1" />
                    <feMerge result="effect2_noise_213_1463">
                      <feMergeNode in="effect1_foregroundBlur_213_1463" />
                      <feMergeNode in="color1" />
                    </feMerge>
                  </filter>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_213_1463" x1="345.529" x2="693.143" y1="93.0065" y2="351.438">
                    <stop offset="0.0807757" stopColor="#474EFF" />
                    <stop offset="0.32177" stopColor="#B066FF" />
                    <stop offset="0.58331" stopColor="#E884C0" />
                    <stop offset="0.904066" stopColor="#FFE366" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[428.718px] left-0 rounded-[15.59px] top-0 w-[758.701px]" data-name="Background" />
      <TextBlock1 />
      <OutilsMenu />
      <Group4 />
    </div>
  );
}

function Container2() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[20.786px] grow h-[449.504px] items-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Container />
      <Container1 />
    </div>
  );
}

function TextBlock2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-[44.43px] not-italic text-[#1e0e62] top-[calc(50%-0.25px)] translate-y-[-50%]" data-name="Text Block">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[23.385px] w-[382px]">Intégré à vos environnements de travail</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] opacity-70 relative shrink-0 text-[20.786px] w-[375px]">Connectez vos espaces internes de façon sécurisée tout en respectant votre gouvernance.</p>
    </div>
  );
}

function IconeGoogleDrive() {
  return (
    <div className="h-[16.763px] relative shrink-0 w-[18.762px]" data-name="Icône Google Drive 2020 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 17">
        <g clipPath="url(#clip0_213_1445)" id="IcoÌne Google Drive 2020 1">
          <path d={svgPaths.p12233600} fill="var(--fill-0, #0066DA)" id="Vector" />
          <path d={svgPaths.pbc54000} fill="var(--fill-0, #00AC47)" id="Vector_2" />
          <path d={svgPaths.p24076500} fill="var(--fill-0, #EA4335)" id="Vector_3" />
          <path d={svgPaths.p28a77d00} fill="var(--fill-0, #00832D)" id="Vector_4" />
          <path d={svgPaths.p416c180} fill="var(--fill-0, #2684FC)" id="Vector_5" />
          <path d={svgPaths.pf86e200} fill="var(--fill-0, #FFBA00)" id="Vector_6" />
        </g>
        <defs>
          <clipPath id="clip0_213_1445">
            <rect fill="white" height="16.7633" width="18.762" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ServiceNameContainer() {
  return (
    <div className="content-stretch flex gap-[4.739px] items-center relative shrink-0" data-name="Service Name Container">
      <IconeGoogleDrive />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#292d32] text-[16.588px] text-nowrap">
        <p className="leading-[1.4] whitespace-pre">Google Drive</p>
      </div>
    </div>
  );
}

function ServiceDetails() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Service Details">
      <ServiceNameContainer />
    </div>
  );
}

function ConfluenceDetails() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Confluence Details">
      <ServiceDetails />
    </div>
  );
}

function ConfluenceInfo() {
  return (
    <div className="content-stretch flex gap-[4.739px] items-center relative shrink-0" data-name="Confluence Info">
      <ConfluenceDetails />
    </div>
  );
}

function Toggle() {
  return (
    <div className="h-[16.588px] relative shrink-0 w-[31.103px]" data-name="Toggle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 17">
        <g id="Toggle">
          <path d={svgPaths.pe93d400} fill="var(--fill-0, #1E0E62)" />
          <circle cx="22.8088" cy="8.29412" fill="var(--fill-0, white)" id="Ellipse 22" r="6.22059" />
        </g>
      </svg>
    </div>
  );
}

function Confluence() {
  return (
    <div className="absolute backdrop-blur-[55.689px] backdrop-filter bg-white box-border content-stretch flex h-[52.134px] items-center justify-between left-[446.61px] p-[14.218px] rounded-[9.479px] top-[22.43px] w-[222.756px]" data-name="Confluence">
      <ConfluenceInfo />
      <Toggle />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute bottom-[2.19%] left-0 right-[0.24%] top-[1.95%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
        <g id="Group">
          <path d={svgPaths.p1d21b300} fill="url(#paint0_linear_213_1441)" id="Vector" />
          <path d={svgPaths.paba400} fill="url(#paint1_linear_213_1441)" id="Vector_2" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_213_1441" x1="1797.29" x2="1359.23" y1="1031.7" y2="26.7315">
            <stop offset="0.18" stopColor="#0052CC" />
            <stop offset="1" stopColor="#2684FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_213_1441" x1="17.5637" x2="456.319" y1="-114.309" y2="891.145">
            <stop offset="0.18" stopColor="#0052CC" />
            <stop offset="1" stopColor="#2684FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function ConfluenceSvgIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-[18.958px]" data-name="Confluence SVG Icon 1">
      <Group />
    </div>
  );
}

function ConfluenceHeader() {
  return (
    <div className="content-stretch flex gap-[4.739px] items-center relative shrink-0" data-name="Confluence Header">
      <ConfluenceSvgIcon />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#292d32] text-[16.588px] text-nowrap">
        <p className="leading-[1.4] whitespace-pre">Confluence</p>
      </div>
    </div>
  );
}

function ConfluenceInfo1() {
  return (
    <div className="content-stretch flex gap-[4.739px] items-center relative shrink-0" data-name="Confluence Info">
      <ConfluenceHeader />
    </div>
  );
}

function Toggle1() {
  return (
    <div className="h-[16.588px] relative shrink-0 w-[31.103px]" data-name="Toggle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 17">
        <g id="Toggle">
          <path d={svgPaths.pe93d400} fill="var(--fill-0, #1E0E62)" />
          <circle cx="22.8088" cy="8.29412" fill="var(--fill-0, white)" id="Ellipse 22" r="6.22059" />
        </g>
      </svg>
    </div>
  );
}

function Confluence1() {
  return (
    <div className="absolute bg-white box-border content-stretch flex h-[52px] items-center justify-between left-[448.61px] p-[14.218px] rounded-[9.479px] top-[140.43px] w-[211px]" data-name="Confluence">
      <ConfluenceInfo1 />
      <Toggle1 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[28.12%_28.13%_6.25%_21.87%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2.097px_-2.097px] mask-size-[9.088px_16.777px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 15">
        <g id="Group">
          <path d={svgPaths.p3f593880} fill="url(#paint0_linear_213_1430)" id="Vector" />
          <path d={svgPaths.p568f080} fill="var(--fill-0, black)" fillOpacity="0.3" id="Vector_2" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_213_1430" x1="3.49529" x2="11.1849" y1="8.73817" y2="12.2334">
            <stop stopColor="#28A6B5" />
            <stop offset="1" stopColor="#31D6EC" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function MaskGroup() {
  return (
    <div className="absolute contents inset-[18.75%_28.13%_6.25%_31.25%]" data-name="Mask group">
      <Group1 />
    </div>
  );
}

function SharepointSvgIcons() {
  return (
    <div className="overflow-clip relative shrink-0 size-[22.37px]" data-name="Sharepoint SVG Icons 1">
      <div className="absolute inset-[6.25%_21.88%_34.38%_18.75%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
          <path d={svgPaths.p1040b700} fill="url(#paint0_linear_213_1461)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_213_1461" x1="0" x2="14.3889" y1="6.64102" y2="6.64102">
              <stop stopColor="#103A3B" />
              <stop offset="1" stopColor="#116B6E" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-[21.88%] left-1/2 right-0 top-[28.13%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
          <path d={svgPaths.pd9ef5f0} fill="url(#paint0_linear_213_1434)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_213_1434" x1="1.39811" x2="11.1849" y1="2.79622" y2="8.38866">
              <stop stopColor="#1D9097" />
              <stop offset="1" stopColor="#29BBC2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <MaskGroup />
      <div className="absolute bottom-[21.88%] left-0 right-[43.75%] top-[21.88%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
          <path d={svgPaths.p1598c500} fill="url(#paint0_linear_213_1436)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_213_1436" x1="0" x2="13.6316" y1="6.29149" y2="6.29149">
              <stop stopColor="#105557" />
              <stop offset="1" stopColor="#116B6E" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[34.38%_59.38%_34.38%_15.62%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 7">
          <path d={svgPaths.p1b35bb80} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function ConfluenceHeader1() {
  return (
    <div className="content-stretch flex gap-[4.739px] items-center relative shrink-0" data-name="Confluence Header">
      <SharepointSvgIcons />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#292d32] text-[16.588px] text-nowrap">
        <p className="leading-[1.4] whitespace-pre">Sharepoint</p>
      </div>
    </div>
  );
}

function ConfluenceInfo2() {
  return (
    <div className="content-stretch flex gap-[4.739px] items-center relative shrink-0" data-name="Confluence Info">
      <ConfluenceHeader1 />
    </div>
  );
}

function Toggle2() {
  return (
    <div className="h-[16.588px] relative shrink-0 w-[31.103px]" data-name="Toggle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 17">
        <g id="Toggle">
          <path d={svgPaths.pe93d400} fill="var(--fill-0, #1E0E62)" />
          <circle cx="22.8088" cy="8.29412" fill="var(--fill-0, white)" id="Ellipse 22" r="6.22059" />
        </g>
      </svg>
    </div>
  );
}

function Confluence2() {
  return (
    <div className="absolute bg-white box-border content-stretch flex h-[52px] items-center justify-between left-[497.61px] p-[14.218px] rounded-[9.479px] top-[81.43px] w-[195px]" data-name="Confluence">
      <ConfluenceInfo2 />
      <Toggle2 />
    </div>
  );
}

function Container3() {
  return (
    <div className="backdrop-blur-[61.06px] backdrop-filter bg-white h-[214.359px] overflow-clip relative rounded-[15.59px] shrink-0 w-full" data-name="Container">
      <div className="absolute flex h-[calc(1px*((var(--transform-inner-width)*0.05983332544565201)+(var(--transform-inner-height)*0.9982084631919861)))] items-center justify-center left-[384.82px] top-[calc(50%+15.45px)] translate-y-[-50%] w-[calc(1px*((var(--transform-inner-height)*0.05983332544565201)+(var(--transform-inner-width)*0.9982084631919861)))]" style={{ "--transform-inner-width": "367.921875", "--transform-inner-height": "292.09375" } as React.CSSProperties}>
        <div className="flex-none rotate-[183.43deg]">
          <div className="h-[292.107px] relative w-[367.931px]">
            <div className="absolute inset-[-33.62%_-26.69%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 565 489">
                <g filter="url(#filter0_fn_213_1453)" id="Ellipse 2" opacity="0.36">
                  <ellipse cx="282.165" cy="244.254" fill="url(#paint0_linear_213_1453)" fillOpacity="0.64" rx="183.965" ry="146.054" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="488.507" id="filter0_fn_213_1453" width="564.331" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feGaussianBlur result="effect1_foregroundBlur_213_1453" stdDeviation="49.1001" />
                    <feTurbulence baseFrequency="inf inf" numOctaves="3" result="noise" seed="3096" stitchTiles="stitch" type="fractalNoise" />
                    <feColorMatrix in="noise" result="alphaNoise" type="luminanceToAlpha" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                      <feFuncA tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " type="discrete" />
                    </feComponentTransfer>
                    <feComposite in="coloredNoise1" in2="effect1_foregroundBlur_213_1453" operator="in" result="noise1Clipped" />
                    <feFlood floodColor="#000000" result="color1Flood" />
                    <feComposite in="color1Flood" in2="noise1Clipped" operator="in" result="color1" />
                    <feMerge result="effect2_noise_213_1453">
                      <feMergeNode in="effect1_foregroundBlur_213_1453" />
                      <feMergeNode in="color1" />
                    </feMerge>
                  </filter>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_213_1453" x1="7.38435" x2="542.961" y1="98.2002" y2="115.517">
                    <stop offset="0.0807757" stopColor="#474EFF" />
                    <stop offset="0.32177" stopColor="#B066FF" />
                    <stop offset="0.58331" stopColor="#E884C0" />
                    <stop offset="0.904066" stopColor="#FFE366" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[428.718px] left-0 rounded-[15.59px] top-0 w-[758.701px]" data-name="Background" />
      <TextBlock2 />
      <Confluence />
      <Confluence1 />
      <Confluence2 />
    </div>
  );
}

function TextBlock3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[9.094px] items-start left-[44.61px] not-italic text-[#1e0e62] top-[calc(50%-0.35px)] translate-y-[-50%] w-[327px]" data-name="Text Block">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[23.385px] text-nowrap whitespace-pre">
        {`Nos experts IA au service `}
        <br aria-hidden="true" />
        de vos experts métiers
      </p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] opacity-70 relative shrink-0 text-[20.786px] w-[327px]">Accélérez vos expertises grâce à nos formations et ateliers pratiques IA.</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="backdrop-blur-[61.06px] backdrop-filter bg-white h-[214.359px] overflow-clip relative rounded-[15.59px] shrink-0 w-full" data-name="Container">
      <div className="absolute h-[428.718px] left-0 rounded-[15.59px] top-0 w-[758.701px]" data-name="Background" />
      <TextBlock3 />
      <div className="absolute flex h-[calc(1px*((var(--transform-inner-width)*0.05983332544565201)+(var(--transform-inner-height)*0.9982084631919861)))] items-center justify-center left-[345.61px] top-[calc(50%+34.17px)] translate-y-[-50%] w-[calc(1px*((var(--transform-inner-height)*0.05983332544565201)+(var(--transform-inner-width)*0.9982084631919861)))]" style={{ "--transform-inner-width": "573.765625", "--transform-inner-height": "442.578125" } as React.CSSProperties}>
        <div className="flex-none rotate-[183.43deg]">
          <div className="h-[442.589px] relative w-[573.777px]">
            <div className="absolute inset-[-22.19%_-17.11%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 771 639">
                <g filter="url(#filter0_fn_213_1413)" id="Ellipse 2" opacity="0.36">
                  <ellipse cx="385.089" cy="319.494" fill="url(#paint0_linear_213_1413)" fillOpacity="0.4" rx="286.888" ry="221.294" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="638.989" id="filter0_fn_213_1413" width="770.177" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feGaussianBlur result="effect1_foregroundBlur_213_1413" stdDeviation="49.1001" />
                    <feTurbulence baseFrequency="inf inf" numOctaves="3" result="noise" seed="3096" stitchTiles="stitch" type="fractalNoise" />
                    <feColorMatrix in="noise" result="alphaNoise" type="luminanceToAlpha" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                      <feFuncA tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " type="discrete" />
                    </feComponentTransfer>
                    <feComposite in="coloredNoise1" in2="effect1_foregroundBlur_213_1413" operator="in" result="noise1Clipped" />
                    <feFlood floodColor="#000000" result="color1Flood" />
                    <feComposite in="color1Flood" in2="noise1Clipped" operator="in" result="color1" />
                    <feMerge result="effect2_noise_213_1413">
                      <feMergeNode in="effect1_foregroundBlur_213_1413" />
                      <feMergeNode in="color1" />
                    </feMerge>
                  </filter>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_213_1413" x1="179.455" x2="548.015" y1="241.393" y2="80.2567">
                    <stop offset="0.0807757" stopColor="#2E8827" />
                    <stop offset="0.32177" stopColor="#FDA70E" />
                    <stop offset="0.535787" stopColor="#E6532F" />
                    <stop offset="0.867569" stopColor="#4E2475" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute aspect-[234/138] bottom-[-0.38px] flex items-center justify-center right-[-28.79px] top-[15.28px]">
        <div className="flex-none h-[199.459px] rotate-[180deg] scale-y-[-100%] w-[338.214px]">
          <div className="relative size-full" data-name="Image">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[113.04%] left-0 max-w-none top-[-13.04%] w-full" src={imgImage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[20.786px] grow items-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Container3 />
      <Container4 />
    </div>
  );
}

function Message() {
  return (
    <div className="absolute bg-[#1e0e62] box-border content-stretch flex flex-col gap-[7.795px] items-start left-[350.43px] p-[15.59px] rounded-bl-[15.59px] rounded-tl-[15.59px] rounded-tr-[15.59px] top-[-18.57px] w-[195px]" data-name="Message">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[18.188px] text-white w-full">
        <p className="leading-[normal]">
          Salut Emma,
          <br aria-hidden="true" />
          {`Comment puis-je vous aider ? `}
        </p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[20.786px] items-start relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <Container5 />
      <Message />
    </div>
  );
}

function TextBlock4() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[9.094px] items-start left-[44.43px] not-italic text-[#1e0e62] top-[calc(50%+0.47px)] translate-y-[-50%] w-[375px]" data-name="Text Block">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[23.385px] w-full">
        {`Pilotez, mesurez et `}
        <br aria-hidden="true" />
        valorisez vos usages de l’IA
      </p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] opacity-70 relative shrink-0 text-[20.786px] w-full">
        {`Gérez les accès, suivez l’adoption et mesurez le ROI de la GenAI grâce `}
        <br aria-hidden="true" />à un tableau de bord clair et complet.
      </p>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-white h-[272.821px] overflow-clip relative rounded-[15.59px] shrink-0 w-full" data-name="Container">
      <div className="absolute flex h-[calc(1px*((var(--transform-inner-width)*0.9990629553794861)+(var(--transform-inner-height)*0.04328201338648796)))] items-center justify-center left-[351.43px] top-[calc(50%+92.74px)] translate-y-[-50%] w-[calc(1px*((var(--transform-inner-height)*0.9990629553794861)+(var(--transform-inner-width)*0.04328201338648796)))]" style={{ "--transform-inner-width": "652.4375", "--transform-inner-height": "1220.046875" } as React.CSSProperties}>
        <div className="flex-none rotate-[267.519deg]">
          <div className="h-[1220.06px] relative w-[652.438px]">
            <div className="absolute inset-[-9.05%_-16.93%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 874 1441">
                <g filter="url(#filter0_fn_213_1411)" id="Ellipse 2" opacity="0.56">
                  <ellipse cx="436.646" cy="720.458" fill="url(#paint0_linear_213_1411)" fillOpacity="0.1" rx="326.219" ry="610.03" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1440.92" id="filter0_fn_213_1411" width="873.293" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feGaussianBlur result="effect1_foregroundBlur_213_1411" stdDeviation="55.2137" />
                    <feTurbulence baseFrequency="inf inf" numOctaves="3" result="noise" seed="3096" stitchTiles="stitch" type="fractalNoise" />
                    <feColorMatrix in="noise" result="alphaNoise" type="luminanceToAlpha" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                      <feFuncA tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " type="discrete" />
                    </feComponentTransfer>
                    <feComposite in="coloredNoise1" in2="effect1_foregroundBlur_213_1411" operator="in" result="noise1Clipped" />
                    <feFlood floodColor="#000000" result="color1Flood" />
                    <feComposite in="color1Flood" in2="noise1Clipped" operator="in" result="color1" />
                    <feMerge result="effect2_noise_213_1411">
                      <feMergeNode in="effect1_foregroundBlur_213_1411" />
                      <feMergeNode in="color1" />
                    </feMerge>
                  </filter>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_213_1411" x1="245.689" x2="973.163" y1="433.846" y2="491.31">
                    <stop offset="0.0807757" stopColor="#474EFF" />
                    <stop offset="0.32177" stopColor="#B066FF" />
                    <stop offset="0.58331" stopColor="#E884C0" />
                    <stop offset="0.904066" stopColor="#FFE366" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[428.718px] left-0 rounded-[15.59px] top-0 w-[758.701px]" data-name="Background" />
      <TextBlock4 />
      <div className="absolute aspect-[980/270] bottom-[-63.47px] right-[11.94px] shadow-[0px_4.002px_74.038px_0px_rgba(0,0,0,0.07)] top-[74.84px]" data-name="1st line forms 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[77.79%] left-0 max-w-none top-0 w-[100.02%]" src={img1stLineForms1} />
        </div>
      </div>
    </div>
  );
}

function Section() {
  return (
    <div className="absolute backdrop-blur-[45.47px] backdrop-filter box-border content-stretch flex flex-col gap-[22.085px] items-end left-1/2 p-[41.573px] rounded-[41.573px] top-[calc(50%-0.22px)] translate-x-[-50%] translate-y-[-50%] w-[1520px]" data-name="Section">
      <div aria-hidden="true" className="absolute border-2 border-[#111350] border-solid inset-[-1px] pointer-events-none rounded-[42.573px] shadow-[0px_3.278px_60.641px_0px_rgba(0,0,0,0.07)]" />
      <Container6 />
      <Container7 />
    </div>
  );
}

export default function Component() {
  return (
    <div className="relative size-full" data-name="8">
      <div className="absolute h-[1080px] left-0 top-0 w-[1920px]" data-name="Background" />
      <Group3 />
      <Section />
    </div>
  );
}