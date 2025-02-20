import { useEffect, useState, useRef } from 'react';
import Image from 'next/image'
import Landing from '../layouts/Landing';
import ScrollSection from '../components/basics/ScrollSection';
import ProductItem from '../components/basics/ProductItem';
import Carousel from '../components/basics/Carousel';
import UserApis from '../actions/apis/users';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from "react-redux";
import { setCategoriesKeys, setCategories, setToken, setBackendWishlist, setDetailedWishlist } from '../redux/actions/user';
import { strings } from '../config/strings';
import { setUser } from '../redux/actions/user';
import { imageBaseUrl } from '../config';
import { setCart } from '../redux/actions/user';
import dynamic from 'next/dynamic';
import { EnglishToArabic } from '../helpers/translations';
import MirayaToast from '../helpers/miraya-toast';
import useMirayaToast from '../helpers/useMirayaToast';
import CategoryScrollSection from '../components/basics/CategoryScrollSection';
import DiscountBanner from '../components/basics/DiscountBanner';

const VideoModal = dynamic(() => import('../components/modals/VideoModal'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
})

const Home = () => {
  const { showToast } = useMirayaToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const [apiActive, setApiActive] = useState(false);
  const categories = useSelector((state) => state.user.categories);
  const [recentProducts, setRecentProducts] = useState([]);
  const language = useSelector((state) => state.language.language);
  const token = useSelector((state) => state.user.token);
  const cart = useSelector((state) => state.user.cart);
  const backend_wishlist = useSelector((state) => state.user.backend_wishlist);
  const detailed_wishlist = useSelector((state) => state.user.detailed_wishlist);
  const user = useSelector((state) => state.user.user);
  const [packagesProducts, setPackagesProducts] = useState([]);
  const specialOffersId = 476, pharmaCareId = 477, bestSellersId = 478, newArrivaldsId = 479, packagesId = 595;
  const [specialOffers, setSpecialOffers] = useState(null);
  const [pharmaCare, setPharmaCare] = useState(null);
  const [bestSellers, setBestSellers] = useState(null);
  const [videoModal, setVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [newArrivals, setNewArrivals] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (language === 'EN') {
      setImages([
        { src: '/MIRAAYA_Valentine_banner 2 EN.jpg', link: `/collections/perfume-offer-883` },
        { src: '/MIRAAYA_Valentine_banner 5 EN.png', link: `collections/valentines-discount-884` },
        // { src: '/brand4_EN.jpg', link: '/link-to-page-3' },
        // { src: '/beauty essentials EN.jpg', link: '/link-to-page-4' },
      ]);
    } else {
      setImages([
        { src: '/MIRAAYA_Valentine_banner 2 AR.jpg', link: `/collections/perfume-offer-883` },
        { src: '/MIRAAYA_Valentine_banner 5 AR.png', link: `collections/valentines-discount-884` },
        // { src: '/brand4_AR.jpg', link: '/link-to-page-3' },
        // { src: '/beauty essentials AR.jpg', link: '/link-to-page-4' },
      ]);
    }
  }, [language]);

  useEffect(() => {
    UserApis.categoryDetails(specialOffersId).then((response) => {
      if (response.status === 200) {
        let data = response.data;
        UserApis.productListing(specialOffersId, token, 1, 'new_arrivals', 12).then((response) => {
          setApiActive(false);
          if (response.status === 200) {
            setSpecialOffers({
              ...data,
              products: response?.data?.items || [],
            })
          }
        });
      }
    });
  }, [specialOffersId, token]);

  useEffect(() => {
    UserApis.categoryDetails(pharmaCareId).then((response) => {
      if (response.status === 200) {
        let data = response.data;
        UserApis.productListing(pharmaCareId, token, 1, 'new_arrivals', 12).then((response) => {
          setApiActive(false);
          if (response.status === 200) {
            setPharmaCare({
              ...data,
              products: response?.data?.items || [],
            })
          }
        });
      }
    });
  }, [pharmaCareId, token]);

  useEffect(() => {
    UserApis.categoryDetails(packagesId).then((response) => {
      if (response.status === 200) {
        let data = response.data;
        UserApis.productListing(packagesId, token, 1, 'new_arrivals', 12).then((response) => {
          setApiActive(false);
          if (response.status === 200) {
            setPackagesProducts(response?.data?.items || []);
          }
        });
      }
    });
  }, [packagesId, token]);

  useEffect(() => {
    UserApis.categoryDetails(bestSellersId).then((response) => {
      if (response.status === 200) {
        let data = response.data;
        UserApis.productListing(bestSellersId, token, 1, 'new_arrivals', 12).then((response) => {
          setApiActive(false);
          if (response.status === 200) {
            setBestSellers({
              ...data,
              products: response?.data?.items || [],
            })
          }
        });
      }
    });
  }, [bestSellersId, token]);

  useEffect(() => {
    UserApis.categoryDetails(newArrivaldsId).then((response) => {
      if (response.status === 200) {
        let data = response.data;
        UserApis.productListing(newArrivaldsId, token, 1, 'new_arrivals', 12).then((response) => {
          setApiActive(false);
          if (response.status === 200) {
            setNewArrivals({
              ...data,
              products: response?.data?.items || [],
            })
          }
        });
      }
    });
  }, [newArrivaldsId, token]);

  useEffect(() => {
    if (token) {
      UserApis.customerDetails(token).then((res) => {
        if (res.status === 200) {
          dispatch(setUser(res.data));
        } else {
          dispatch(setToken(null));
          dispatch(setUser(null));
          dispatch(setBackendWishlist(null));
          dispatch(setDetailedWishlist(null));
          router.push('/logout');
        }
      });
    }
  }, [token, dispatch, router]);

  useEffect(() => {
    if (user && token) {
      UserApis.getWislist(user.id, token).then((res) => {
        if (res.data && typeof res.data === 'object') {
          dispatch(setBackendWishlist(res.data));
          let ids = res.data.map((item) => item.product_id);
          UserApis.productListingByIds(ids, token).then((res) => {
            if (res.data && typeof res.data === 'object') {
              let data = res?.data?.items?.map((item) => ({
                id: item.id,
                image_url: imageBaseUrl + item?.media_gallery_entries[0]?.file,
                sku: item.sku,
                name: item.name,
                custom_attributes: item.custom_attributes,
                price: item.price,
              }));
              let filteredData = data.filter((item) => ids.includes(item.id.toString()));
              dispatch(setDetailedWishlist(filteredData));
            }
          })
        }
      });
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    setTimeout(() => {
      if (!cart) {
        dispatch(setCart([]));
      }
    }, 2000);
  }, [cart, dispatch]);

  useEffect(() => {
    UserApis.productListingRecent().then((res) => {
      setRecentProducts(res.data?.items);
    });
  }, []);

  useEffect(() => {
    UserApis.categories().then((res) => {
      if (res.status === 200) {
        setTimeout(() => {
          setApiActive(false)
        }, 4000);
        let categoryObjs = {};
        let categories = [];
        let allCategories = []
        res?.data?.children_data?.forEach((category) => {
          let slug = category.name.split(' ').join('-').toLowerCase();
          if (category.is_active === true) {
            categoryObjs[slug] = {
              id: category.id,
              name: category.name,
              parent_id: category.parent_id,
              slug: slug,
            }
            allCategories.push({
              id: category.id,
              name: category.name,
            })
            let categoryItem = {
              id: category.id,
              name: category.name,
              slug: slug,
              children: []
            }
            category.children_data.forEach((subCategory) => {
              allCategories.push({
                id: subCategory.id,
                name: subCategory.name,
              })
              let subSlug = subCategory.name.split(' ').join('-').toLowerCase();
              if (subCategory.is_active === true) {
                let subCategoryItem = {
                  id: subCategory.id,
                  name: subCategory.name,
                  slug: subSlug,
                  children: []
                }
                subCategory.children_data.forEach((subSubCategory) => {
                  allCategories.push({
                    id: subSubCategory.id,
                    name: subSubCategory.name,
                  })
                  let subSubSlug = subSubCategory.name.split(' ').join('-').toLowerCase();
                  if (subSubCategory.is_active === true) {
                    subCategoryItem.children.push({
                      id: subSubCategory.id,
                      name: subSubCategory.name,
                      slug: subSubSlug,
                    })
                    categoryObjs[subSubSlug] = {
                      id: subSubCategory.id,
                      name: subSubCategory.name,
                      parent_id: subSubCategory.parent_id,
                      slug: subSubSlug,
                    }
                  }
                })
                categoryItem.children.push(subCategoryItem);
                categoryObjs[subSlug] = {
                  id: subCategory.id,
                  name: subCategory.name,
                  parent_id: subCategory.parent_id,
                  slug: subSlug,
                }
              }
            })
            categories.push(categoryItem);
          }
        });
        dispatch(setCategoriesKeys(categoryObjs));
        dispatch(setCategories(categories));
      }
    });
  }, [dispatch]);

  const scrollContainerRef = useRef(null);
  const scroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += scrollOffset;
    }
  };

  const scrollContainerRef1 = useRef(null);
  const scroll1 = (scrollOffset) => {
    if (scrollContainerRef1.current) {
      scrollContainerRef1.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  const [centerIndex, setCenterIndex] = useState(null);
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);


  // const generateGiftCards = async () => {
  //   try {
  //     const response = await fetch('/api/genGiftCards');
  //     if (!response.ok) {
  //       throw new Error('Failed to generate gift cards');
  //     }

  //     const csvResponse = await fetch('/api/giftcardCSV');
  //     if (!csvResponse.ok) {
  //       throw new Error('Failed to download CSV');
  //     }

  //     const blob = await csvResponse.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.style.display = 'none';
  //     a.href = url;
  //     a.download = 'giftcards.csv';
  //     document.body.appendChild(a);
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     showToast('Gift cards generated and CSV downloaded successfully', 'success');
  //   } catch (error) {
  //     console.error('Error generating gift cards:', error);
  //     showToast('Failed to generate gift cards', 'error');
  //   } finally {
  //   }
  // };

  return (
    (apiActive === true && categories?.length === 0) ? <div>Loading...</div> :
      <Landing leftMenuOpen={leftMenuOpen} setLeftMenuOpen={setLeftMenuOpen}>
        {process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev' && <DiscountBanner />}
        <Carousel images={images} />

        <ScrollSection title={strings('shops_by_brands', language)}>
          {brands.map((brand) => (
            <a
              key={brand.id}
              href={brand.slug ? `${brand.slug}` : ''}
              className='flex flex-col'>
              <div className='sm:!w-[250px] sm:h-[208px] w-[117px] h-[98px] bg-[#F9F9F9] flex justify-center items-center'>
                <Image
                  src={brand.image}
                  alt={brand.name}
                  width={250}
                  height={208}
                  loading="lazy"
                  quality={75}
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(250, 208))}`}
                />
              </div>
              <p className='font-BrandonMedium  uppercase text-dark text-center mt-1 sm:mt-5 text-xs sm:text-xl sm:leading-[24px]'>{brand.name}</p>
            </a>
          ))}
        </ScrollSection>

        {/* <div>
          <h2 className={`sm:text-[32px] sm:pt-[70px] pt-11 sm:leading-[40px] text-base font-BrandonBlack tracking-[-2%] flex-1 text-[#333333] uppercase ${language === 'AR' && ' text-end '}`}>{strings('categories', language)}</h2>
          <div className=' mt-4 grid grid-cols-5 gap-2 sm:gap-6'>
            {categoriesData.map((category) => (
              <div
                onClick={() => {
                  router.push(`${category.slug}`)
                }}
                className='flex flex-col mt-1 mb-2 col-span-1 cursor-pointer'>
                <img src={category.src} alt={category.name} className='' />
                <div className='w-full flex justify-end'>
                  <p className='mt-[3px] sm:mt-2 sm:text-xl font-BrandonMedium text-[10px] text-dark tracking-[-.2px] '>{category.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
        {/* 
        <Category
          mobile={true}
          // rows={2}
          title={strings('categories', language)}>
          {(language === 'AR' ? [...categoriesData].reverse() : categoriesData).map((category) => (
            <div
              key={category.slug}
              onClick={() => {
                router.push(`${category.slug}`)
              }}
              className='flex flex-col mt-1 mb-2 col-span-1 cursor-pointer'>
              <img src={category.src} alt={category.name} className='' />
              <div className={`w-full flex ${language === 'AR' && 'justify-end '}`}>
                <p className='mt-[3px] sm:mt-2 sm:text-xl font-BrandonMedium text-[10px] text-dark tracking-[-.2px] '>{language === 'AR' ? EnglishToArabic(category.name) : category.name}</p>
              </div>
            </div>
          ))}
        </Category> */}
        <CategoryScrollSection categoriesData={categoriesData} strings={strings} />

        {/* <ScrollSection title={strings('exclusive_offers_in_miraaya', language)}> */}
        <ScrollSection
          title={strings('special_offers', language)}>
          {specialOffers?.products?.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              showError={(msg) => showToast(msg, 'error')}
              showSuccess={(msg) => showToast(msg, 'success')}
            />
          ))}
        </ScrollSection>
        <div className='gap-[20px] flex flex-col lg:flex-row mt-4 lg:mt-20'>
          <div
            // onClick={() => router.push('/collections/hudabeauty-855')}
            className='flex-1 flex justify-center cursor-pointer'>
            <Image
              src={language === 'AR' ? '/MIRAAYA_Valentine_banner 4 AR.jpg' : '/MIRAAYA_Valentine_banner 4 EN.jpg'}
              alt='banner'
              width={800}
              height={365}
              className='sm:h-[365px] md:h-[300px] w-full'
              loading="eager"
              quality={75}
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(800, 365))}`}
            />
          </div>
          <div
            onClick={() => router.push('/collections/hudabeauty-855')}
            className='flex flex-1 justify-center cursor-pointer'>
            <Image
              src={language === 'AR' ? '/MIRAAYA_Valentine_banner 3 AR.jpg' : '/MIRAAYA_Valentine_banner 3 EN.jpg'}
              alt='banner'
              width={800}
              height={365}
              className='sm:h-[365px] md:h-[300px] w-full self-stretch'
              loading="eager"
              quality={75}
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(800, 365))}`}
            />
          </div>
        </div>
        <ScrollSection
          title={strings('our_bestsellers', language)}>
          {bestSellers?.products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              showError={(msg) => showToast(msg, 'error')}
              showSuccess={(msg) => showToast(msg, 'success')}
            />
          ))}
        </ScrollSection>
        <ScrollSection
          title={strings('pharmacy_care', language)}>
          {pharmaCare?.products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              showError={(msg) => showToast(msg, 'error')}
              showSuccess={(msg) => showToast(msg, 'success')}
            />
          ))}
        </ScrollSection>

        <ScrollSection title={strings('valentines_bundles', language)}>
          {packagesProducts.map((product) => (
              <ProductItem
                  key={product.id}
                  product={product}
                  showError={(msg) => showToast(msg, 'error')}
                  showSuccess={(msg) => showToast(msg, 'success')}
              />
          ))}
        </ScrollSection>

        {/* <MirayaToast /> */}
        <VideoModal
          video={selectedVideo}
          showModal={videoModal}
          setShowModal={setVideoModal}
        />
      </Landing>

  )
}

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)



export async function getStaticProps() {
  const images = [
    '/skincare banner EN.jpg',
    '/beauty essentials EN.jpg',
  ];

  return {
    props: {
      title: "Shop the Best in Beauty: Makeup, Skincare, Fragrance & Haircare | MIRAAYA",
      metaDescription: "Discover top beauty buys at MIRAAYA! From makeup and skincare to fragrance and haircare, explore trending brands and elevate your beauty routine today.",
      canonicalUrl: "https://www.miraaya.com/",
      images: images,
    }
  }
}

export default Home;


const beauty = [
  {
    image: '/video1.mp4',
    path: '/product/catrice-pastel-please-nail-polish-010-pastel/4059729445827',
    brand: 'Catrice',
    poster: '/poster1.png',
    title: 'Catrice Pastel Please Nail Polish - 010 Pastel',
    price: '7,000',
    image1: `${process.env.NEXT_PUBLIC_MAGENTO_BASE_URL}/media/catalog/product//4/0/4059729445827_1_3.jpg`,
  },
  {
    image: '/video2.mp4',
    path: '/product/the-ordinary-buffet-multi-technology-peptide-serum/769915190403',
    brand: 'The Ordinary',
    poster: '/poster2.png',
    title: 'The Ordinary Buffet Multi-Technology Peptide Serum',
    price: '38,000',
    image1: `${process.env.NEXT_PUBLIC_MAGENTO_BASE_URL}/media/catalog/product//7/6/769915190403_1_5.jpg`,
  }, {
    image: '/video3.mp4',
    path: '/product/cetaphil-gentle-foaming-cleanser/SKU-101',
    poster: '/poster3.png',
    brand: 'Cetaphil',
    title: 'Cetaphil Gentle Foaming Cleanser',
    price: '27,000',
    image1: `${process.env.NEXT_PUBLIC_MAGENTO_BASE_URL}/media/catalog/product//3/4/3499320010085_1_7.jpg`,
  }, {
    image: '/video4.mp4',
    path: '/product/bassam-fattouh-readt-to-wear-foundation/Bassam-Fattouh-Readt-To-Wear-Foundation',
    brand: 'Bassam Fattouh',
    poster: '/poster4.png',
    title: 'Bassam Fattouh Ready-To-Wear Foundation',
    price: '80,000',
    image1: `${process.env.NEXT_PUBLIC_MAGENTO_BASE_URL}/media/catalog/product//3/7/3760139254152_1_3.jpg`,
  }, {
    path: '/product/skin-proud-sleep-defence-calming-kombucha-overnight-mask/5056183604479',
    image: '/video5.mp4',
    poster: '/poster5.png',
    brand: 'Skin Proud',
    title: 'Skin Proud Sleep Defence Calming Kombucha Overnight Mask',
    price: '31,000',
    image1: `${process.env.NEXT_PUBLIC_MAGENTO_BASE_URL}/media/catalog/product//5/0/5056183604479_1_1.jpg`,
  },
  {
    image: '/video6.mp4',
    path: '/product/eveline-facemed-micellar-organic-rose-water-face-wash-gel/5903416033493',
    brand: 'Eveline',
    poster: '/poster6.png',
    title: 'Eveline Facemed+ Micellar Organic Rose Water Face Wash Gel',
    price: '7,500',
    image1: `${process.env.NEXT_PUBLIC_MAGENTO_BASE_URL}/media/catalog/product//5/9/5903416033493_1_4.jpg`,
  },
]

const brands = [
  {
    id: 1,
    name: 'Anastasia',
    image: '/Frame8.png',
    slug: 'collections/anastasia-601'
  },
  // {
  //   id: 2,
  //   name: 'BEAUTY BAY',
  //   image: '/beauty.png',
  //   slug: 'beauty-bay'
  // },
  {
    id: 3,
    name: 'Bioderma',
    image: '/Frame9.png',
    slug: '/collections/bioderma-444'
  },
  {
    id: 4,
    name: 'Clarins',
    image: '/Frame 8.png',
    slug: 'collections/clarins-405'
  },
  {
    id: 5,
    name: 'Dolce & Gabbana',
    image: '/Frame 9.png',
    slug: '/collections/dolce-&-gabbana-484'
  },
  {
    id: 6,
    name: 'Huda Beauty',
    image: '/Huda.png',
    slug: '/collections/hudabeauty-855'
  },
  {
    id: 7,
    name: 'Kevin Murphy',
    image: '/Frame 10.png',
    slug: '/collections/kevin-murphy-441'
  },
  {
    id: 8,
    name: 'Lancome',
    image: '/Frame 11.png',
    slug: '/collections/lancome-549'
  }, {
    id: 9,
    name: 'Philips',
    image: '/Frame 12.png',
    slug: '/collections/philips-472'
  },
  {
    id: 10,
    name: 'YSL',
    image: '/Frame 14.png',
    slug: '/collections/yves-saint-laurent-599'
  },
  // {
  //   id: 9,
  //   name: 'La Roche Posay',
  //   image: '/Frame 15.png',
  //   slug: '/collections/la-roche-posay-864'
  // },
  {
    id: 11,
    name: 'The Balm',
    image: '/Frame 23.png',
    slug: '/collections/the-balm-430'
  },
];

const community = [
  {
    title: 'Glow Like A Goddess With The Best Body Shimmer Lotions And Beyond.',
    image: '/c1.jpeg',
  },
  {
    title: 'DUO MASCARA BY CRAZE - THE QUEEN OF MULTI-FUNCTIONALITY.',
    image: '/c2.jpeg',
  },
  {
    title: 'BEST MAKEUP TIPS TO FOLLOW FOR OILY SKIN DURING SUMMER.',
    image: '/c3.jpeg',
  },
  {
    title: 'Glow Like A Goddess With The Best Body Shimmer Lotions And Beyond.',
    image: '/c1.jpeg',
  },
  {
    title: 'DUO MASCARA BY CRAZE - THE QUEEN OF MULTI-FUNCTIONALITY.',
    image: '/c2.jpeg',
  },
  {
    title: 'BEST MAKEUP TIPS TO FOLLOW FOR OILY SKIN DURING SUMMER.',
    image: '/c3.jpeg',
  }
]

const trending = [
  {
    title: 'Tiara’s GoldenGlow secret Products',
    image: '/l1.jpeg',
  },
  {
    title: 'THe Ultimate beauty Guide from Fathima',
    image: '/l2.jpeg',
  },
  {
    title: 'the best of summers’s face glow products',
    image: '/l3.jpeg',
  },
  {
    title: 'Tiara’s GoldenGlow secret Products',
    image: '/l1.jpeg',
  },
  {
    title: 'THe Ultimate beauty Guide from Fathima',
    image: '/l2.jpeg',
  },
  {
    title: 'the best of summers’s face glow products',
    image: '/l3.jpeg',
  }
]

const exclusiveProducts = [
  {
    id: 1,
    name: 'Jelly pop Dew Printer',
    brand: 'LAKME',
    image: '/p1.png',
    price: '$30.00',
    off: '35% off',
    rating: 4,
  },
  {
    id: 2,
    name: 'Jelly pop Dew Printer',
    brand: 'LAKME',
    image: '/p2.png',
    price: '$34.00',
    rating: 4,
    off: '35% off',
    is_exclusive: true,
  },
  {
    id: 3,
    name: 'Jelly pop Dew Printer',
    brand: 'ELF Cosmetics',
    rating: 4,
    image: '/p3.png',
    price: '$43.00',
    off: '35% off',
    flash_text: 'Get in 6 hrs 30 Mins'
  },
  {
    id: 4,
    name: 'Jelly pop Dew Printer',
    brand: 'LAKME',
    image: '/p4.png',
    price: '$32.00',
    off: '35% off',
    rating: 4,
  },
  {
    id: 5,
    name: 'Jelly pop Dew Printer',
    rating: 4,
    brand: 'LAKME',
    image: '/p5.png',
    price: '$50.00',
    off: '35% off',
  },
  {
    id: 6,
    name: 'Jelly pop Dew Printer',
    brand: 'LAKME',
    image: '/p6.png',
    rating: 4,
    is_exclusive: true,
    price: '$60.00',
    off: '35% off',
  },
  {
    id: 7,
    name: 'Jelly pop Dew Printer',
    brand: 'ELF Cosmetics',
    image: '/p7.png',
    rating: 4,
    price: '$12.00',
    off: '35% off',
  },
  {
    id: 8,
    name: 'Jelly pop Dew Printer',
    brand: 'ELF Cosmetics',
    rating: 4,
    image: '/p7.png',
    price: '$30.00',
    off: '35% off',
  },
  {
    id: 9,
    name: 'Jelly pop Dew Printer',
    brand: 'ELF Cosmetics',
    image: '/p2.png',
    rating: 4,
    price: '$30.00',
    off: '35% off',
  },
  {
    id: 10,
    name: 'Jelly pop Dew Printer',
    brand: 'LAKME',
    image: '/p5.png',
    rating: 4,
    price: '$30.00',
    off: '35% off',
  },

]


const categoriesData = [
  {
    id: `skincare-52`,
    name: 'Skin Care',
    slug: '/collections/skincare-52',
    src: '/skincare.png',
  },
  {
    id: `hair-care-50`,
    name: 'Hair Care',
    slug: '/collections/hair-care-50',
    src: '/haircare.png',
  },
  {
    id: `makeup-51`,
    name: 'Makeup',
    slug: 'collections/makeup-51',
    src: '/makeup.png',
  },
  {
    id: `fragrances-365`,
    name: 'Fragrances',
    slug: '/collections/fragrances-365',
    src: '/fragrances.png',
  },

  {
    id: `devices-48`,
    name: 'Devices',
    slug: '/collections/devices-48',
    src: '/devices.png',
  },
  {
    id: `lashes-and-lenses-47`,
    name: 'Lashes and Lenses',
    slug: '/collections/lashes-and-lenses-47',
    src: '/lashes.png',
  },
  {
    id: `shaving-and-hair-removal-46`,
    name: 'Shaving and Hair Removal',
    slug: '/collections/shaving-and-hair-removal-46',
    src: '/shaving.png',
  },
  {
    id: `bath-and-relax-45`,
    name: 'Bath and Relax',
    slug: '/collections/bath-and-relax-45',
    src: '/bath.png',
  },
  {
    id: `personal-care-44`,
    name: 'Personal Care',
    slug: '/collections/personal-care-44',
    src: '/personalcare.png',
  },
  {
    id: `vitamins-and-supplements-43`,
    name: 'Vitamins and Supplements',
    slug: '/collections/vitamins-and-supplements-43',
    src: '/vitamins.png',
  },
  // {
  //   id: `brands`,
  //   name: 'Brands',
  //   slug: '/brands',
  //   src: '/brands.svg',
  // },
  // {
  //   id: `gift-cards-42`,
  //   name: 'Gift Card',
  //   slug: '/collections/gift-cards-42',
  //   src: '/giftcard.svg',
  // }
]
