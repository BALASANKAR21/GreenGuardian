export type WeatherData = {
  main: {
    temp: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  name: string;
};

export type AirQualityData = {
  status: string;
  data: {
    current: {
      pollution: {
        ts: string;
        aqius: number;
        mainus: 'p2' | 'p1' | 'o3' | 'n2' | 's2' | 'co';
        p2: { conc: number; aqiv: number };
      };
    };
  };
};

export type Plant = {
  id: string;
  name: string;
  imageId: string;
  careLevel: 'Newbie' | 'Intermediate' | 'Expert';
  pros: string[];
  cons: string[];
  description: string;
  light: 'low' | 'medium' | 'high';
  space: 'small' | 'medium' | 'large';
};

export type Vlog = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  date: string;
  imageId: string;
  content: string[];
};
