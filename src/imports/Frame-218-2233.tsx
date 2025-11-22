function Frame1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-[128px] not-italic top-[calc(50%-52px)] translate-y-[-50%] w-[1329px]">
      <div className="font-['Inter:Bold',sans-serif] font-bold leading-[0] relative shrink-0 text-[0px] text-white tracking-[-1.92px] w-[1329px]">
        <p className="leading-[1.2] mb-0 text-[96px]">Réduire la friction entre</p>
        <p className="leading-[1.2] text-[96px]">
          <span>{`Design et Code `}</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal not-italic text-[#cfcfcf] tracking-[-1.92px]">(avec Figma)</span>
        </p>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.32] relative shrink-0 text-[#cfcfcf] text-[36px] tracking-[-0.72px] w-[1298px]">
        {`Transformer la friction en synergie `}
        <br aria-hidden="true" />
        pour créer des produits numériques performants
      </p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[284px]">
      <p className="font-['Inter:Bold',sans-serif] font-bold min-w-full relative shrink-0 text-white w-[min-content]">Emma Jan</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#cfcfcf] text-center text-nowrap whitespace-pre">{`Product Designer `}</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex items-end justify-between leading-[1.32] left-[128px] not-italic text-[36px] top-[901px] tracking-[-0.72px] w-[1694px]">
      <Frame2 />
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#cfcfcf] text-center text-nowrap whitespace-pre">Janvier 2026</p>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-[#16161d] relative w-[1920px] h-[1080px]" data-name="Frame">
      <Frame1 />
      <Frame3 />
    </div>
  );
}
