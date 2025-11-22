export default function Frame() {
  return (
    <div className="bg-[#16161d] relative w-full h-full flex flex-col justify-between p-[128px]" data-name="Frame">
      {/* Contenu principal centré verticalement */}
      <div className="flex-1 flex flex-col justify-center gap-[24px]">
        <div className="font-['Inter:Bold',sans-serif] font-bold text-white tracking-[-1.92px]">
          <p className="leading-[1.2] mb-0 text-[96px]">Réduire la friction entre</p>
          <p className="leading-[1.2] text-[96px]">
            <span>Design et Code </span>
            <span className="font-['Inter:Regular',sans-serif] font-normal text-[#cfcfcf]">(avec Figma)</span>
          </p>
        </div>
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.32] text-[#cfcfcf] text-[36px] tracking-[-0.72px] max-w-[1298px]">
          Transformer la friction en synergie
          <br />
          pour créer des produits numériques performants
        </p>
      </div>

      {/* Footer avec nom et date */}
      <div className="flex items-end justify-between text-[36px] leading-[1.32] tracking-[-0.72px]">
        <div className="flex flex-col">
          <p className="font-['Inter:Bold',sans-serif] font-bold text-white mb-0">Emma Jan</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#cfcfcf]">Product Designer</p>
        </div>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#cfcfcf]">Janvier 2026</p>
      </div>
    </div>
  );
}
