export type FeaturedUniversity = {
  id: string;
  name: string;
  shortName: string;
  location: string;
  focus: string;
  website: string;
  imageUrl: string;
  imageCredit: string;
  imageSource: string;
};

export const featuredUniversities: FeaturedUniversity[] = [
  {
    id: "utokyo",
    name: "The University of Tokyo",
    shortName: "UTokyo",
    location: "Tokyo",
    focus: "AI / CS / IST",
    website: "https://www.u-tokyo.ac.jp/en/",
    imageUrl: "/universities/utokyo.jpg",
    imageCredit: "Daderot, CC0",
    imageSource: "https://commons.wikimedia.org/wiki/File:Yasuda_Auditorium_-_Hongo_Campus,_the_University_of_Tokyo_-_DDSC04886.JPG",
  },
  {
    id: "science-tokyo",
    name: "Institute of Science Tokyo",
    shortName: "Science Tokyo",
    location: "Tokyo / Yokohama",
    focus: "Systems / CS / AI",
    website: "https://www.isct.ac.jp/en",
    imageUrl: "/universities/science-tokyo.jpg",
    imageCredit: "Kakidai, CC BY-SA 4.0",
    imageSource: "https://commons.wikimedia.org/wiki/File:West_Building_1_-_Ookayama_Campus,_the_Institute_of_Science_Tokyo.jpg",
  },
  {
    id: "osaka",
    name: "Osaka University",
    shortName: "Osaka",
    location: "Osaka",
    focus: "IST / Engineering",
    website: "https://www.osaka-u.ac.jp/en",
    imageUrl: "/universities/osaka.jpg",
    imageCredit: "Soraie8288, CC BY-SA 4.0",
    imageSource: "https://commons.wikimedia.org/wiki/File:Osaka_university_toyonaka_main_entrance.jpg",
  },
  {
    id: "tohoku",
    name: "Tohoku University",
    shortName: "Tohoku",
    location: "Sendai",
    focus: "AI / Robotics / InfoSci",
    website: "https://www.tohoku.ac.jp/en/",
    imageUrl: "/universities/tohoku.jpg",
    imageCredit: "Kasadera, CC BY 2.0",
    imageSource: "https://commons.wikimedia.org/wiki/File:Tohoku_university_-_Kawanai_campus_entrance.JPG",
  },
  {
    id: "tsukuba",
    name: "University of Tsukuba",
    shortName: "Tsukuba",
    location: "Tsukuba",
    focus: "CS / Interaction / Systems",
    website: "https://www.tsukuba.ac.jp/en/",
    imageUrl: "/universities/tsukuba.jpg",
    imageCredit: "D.328, CC BY-SA 3.0",
    imageSource: "https://commons.wikimedia.org/wiki/File:University_of_Tsukuba_1.jpg",
  },
];

export function findFeaturedUniversity(id: string | null): FeaturedUniversity | undefined {
  return featuredUniversities.find((university) => university.id === id);
}
