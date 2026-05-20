type CatalogHeroIntroProps = {
  seeLessLabel?: string | undefined;
  seeMoreLabel?: string | undefined;
  text: string;
};

export function CatalogHeroIntro({
  text,
}: CatalogHeroIntroProps) {
  return (
    <div className="catalog-hero__intro__SW3au">
      <p
        className="catalog-hero__description__SW3av"
      >
        {text}
      </p>
    </div>
  );
}
