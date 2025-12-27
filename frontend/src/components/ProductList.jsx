import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRupeeSign, FaSpinner, FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { fetchSarees } from '../services/api';

// Add CSS to hide scrollbar
const styles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const ProductList = ({ defaultCategory } = {}) => {
  const { categoryName, subCategoryName } = useParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filter states
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [customPriceFrom, setCustomPriceFrom] = useState('');
  const [customPriceTo, setCustomPriceTo] = useState('');
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  
  // Accordion states for desktop filters
  const [openSections, setOpenSections] = useState({
    price: true,
    material: true
  });
  
  // Available fabric options
  const allPossibleFabrics = ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Linen', 'Satin', 'Velvet', 'Organza', 'Banarasi', 'Kanjivaram', 'Katan', 'Tussar', 'Maheshwari', 'Chanderi', 'Kota', 'Gota Patti', 'Zari', 'Zardosi', 'Resham', 'Kalamkari', 'Bandhani', 'Leheriya', 'Patola', 'Paithani', 'Baluchari', 'Dhakai', 'Jamdani', 'Khesh', 'Muga', 'Eri', 'Mysore', 'Uppada', 'Gadwal', 'Venkatagiri', 'Narayanpet', 'Bomkai', 'Sambalpuri', 'Khandua', 'Kotpad', 'Bhagalpur', 'Tussar', 'Muga', 'Eri', 'Mysore Silk', 'Kanchipuram', 'Kanjivaram', 'Banarasi Silk', 'Chanderi', 'Maheshwari', 'Kota Doria', 'Gota Work', 'Zari Work', 'Zardosi Work', 'Resham Work', 'Kalamkari', 'Bandhani', 'Leheriya', 'Patola', 'Paithani', 'Baluchari', 'Dhakai', 'Jamdani', 'Khesh', 'Muga', 'Eri', 'Mysore', 'Uppada', 'Gadwal', 'Venkatagiri', 'Narayanpet', 'Bomkai', 'Sambalpuri', 'Khandua', 'Kotpad', 'Bhagalpur', 'Tussar', 'Muga', 'Eri', 'Mysore Silk', 'Kanchipuram', 'Kanjivaram', 'Banarasi Silk', 'Chanderi', 'Maheshwari', 'Kota Doria', 'Gota Work', 'Zari Work', 'Zardosi Work', 'Resham Work', 'Kalamkari', 'Bandhani', 'Leheriya', 'Patola', 'Paithani', 'Baluchari', 'Dhakai', 'Jamdani', 'Khesh', 'Muga', 'Eri', 'Mysore', 'Uppada', 'Gadwal', 'Venkatagiri', 'Narayanpet', 'Bomkai', 'Sambalpuri', 'Khandua', 'Kotpad', 'Bhagalpur', 'Tussar', 'Muga', 'Eri', 'Mysore Silk', 'Kanchipuram', 'Kanjivaram', 'Banarasi Silk', 'Chanderi', 'Maheshwari', 'Kota Doria', 'Gota Work', 'Zari Work', 'Zardosi Work', 'Resham Work', 'Kalamkari', 'Bandhani', 'Leheriya', 'Patola', 'Paithani', 'Baluchari', 'Dhakai', 'Jamdani', 'Khesh', 'Muga', 'Eri', 'Mysore', 'Uppada', 'Gadwal', 'Venkatagiri', 'Narayanpet', 'Bomkai', 'Sambalpuri', 'Khandua', 'Kotpad', 'Bhagalpur', 'Tussar', 'Muga', 'Eri', 'Mysore Silk', 'Kanchipuram', 'Kanjivaram', 'Banarasi Silk', 'Chanderi', 'Maheshwari', 'Kota Doria', 'Gota Work', 'Zari Work', 'Zardosi Work', 'Resham Work'];
  
  // Extract unique fabrics from products
  const availableFabrics = React.useMemo(() => {
    const fabricSet = new Set();
    
    products.forEach(product => {
      // Check multiple possible fields that might contain fabric info
      const possibleFabricFields = [
        product.fabric,
        product.material,
        product.product_info?.fabric,
        product.product_info?.material,
        product.details?.fabric,
        product.details?.material,
        product.description,
        product.title
      ];
      
      // Check each field for fabric matches
      possibleFabricFields.forEach(field => {
        if (field) {
          const fieldStr = String(field).toLowerCase();
          allPossibleFabrics.forEach(fabric => {
            if (fieldStr.includes(fabric.toLowerCase())) {
              fabricSet.add(fabric);
            }
          });
        }
      });
    });
    
    // Add some common fabrics if none found
    if (fabricSet.size === 0) {
      return ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Linen', 'Satin', 'Velvet', 'Organza'];
    }
    
    return Array.from(fabricSet).sort();
  }, [products]);
  
  const priceRanges = [
    { id: 1, label: '₹500–600', min: 500, max: 600 },
    { id: 2, label: '₹601–700', min: 601, max: 700 },
    { id: 3, label: '₹701–800', min: 701, max: 800 },
    { id: 4, label: '₹801–900', min: 801, max: 900 },
    { id: 5, label: '₹901–1,000', min: 901, max: 1000 },
    { id: 6, label: '₹1,001–1,100', min: 1001, max: 1100 },
    { id: 7, label: '₹1,101–1,200', min: 1101, max: 1200 },
    { id: 8, label: '₹1,201–1,300', min: 1201, max: 1300 },
    { id: 9, label: '₹1,301–1,400', min: 1301, max: 1400 },
    { id: 10, label: '₹1,401–1,500', min: 1401, max: 1500 },
  ];
  
  const normalize = (s) => {
    if (!s) return '';
    const t = s.replace(/-/g, ' ').toLowerCase();
    return t.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const effectiveCategory = subCategoryName
    ? normalize(subCategoryName)
    : (categoryName || defaultCategory) ? normalize(categoryName || defaultCategory) : '';

  // Fetch products
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSarees(effectiveCategory || '');
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [effectiveCategory]);
  
  // Apply filters
  useEffect(() => {
    let result = [...products];
    
    // Filter by price range
    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.id === selectedPriceRange);
      if (range) {
        result = result.filter(p => {
          const price = p.price || (p.mrp - p.mrp * ((p.discountPercent || 0) / 100));
          return price >= range.min && price <= range.max;
        });
      }
    }
    
    // Filter by fabric
    if (selectedFabrics.length > 0) {
      result = result.filter(p => {
        // Check multiple possible fields that might contain fabric info
        const possibleFabricFields = [
          p.fabric,
          p.material,
          p.product_info?.fabric,
          p.product_info?.material,
          p.details?.fabric,
          p.details?.material,
          p.description,
          p.title
        ];
        
        // Convert all fabric fields to a single searchable string
        const fabricSearchString = possibleFabricFields
          .filter(Boolean)
          .map(String)
          .join(' ')
          .toLowerCase();
        
        // Check if any selected fabric is in the search string
        return selectedFabrics.some(fabric => 
          fabricSearchString.includes(fabric.toLowerCase())
        );
      });
    }
    
    setFilteredProducts(result);
  }, [products, selectedPriceRange, selectedFabrics]);
  
  const toggleFabric = (fabric) => {
    setSelectedFabrics(prev => 
      prev.includes(fabric)
        ? prev.filter(f => f !== fabric)
        : [...prev, fabric]
    );
  };
  
  const resetFilters = () => {
    setSelectedPriceRange(null);
    setSelectedFabrics([]);
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

    
  // Scroll to top whenever category changes so the heading/top section is visible
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryName, subCategoryName]);

  const handleCardClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  const activeFilterCount = [
    selectedFabrics.length,
    selectedPriceRange ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFilterCount > 0 && (
          <button 
            onClick={resetFilters}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex justify-between items-center w-full mb-4"
        >
          <h4 className="text-sm font-medium text-gray-900">Price</h4>
          {openSections.price ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        
        {openSections.price && (
          <div className="space-y-3">
            {priceRanges.map(range => (
              <div key={range.id} className="flex items-center">
                <input
                  type="radio"
                  id={`price-${range.id}`}
                  name="priceRange"
                  checked={selectedPriceRange === range.id}
                  onChange={() => setSelectedPriceRange(range.id)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 cursor-pointer"
                />
                <label htmlFor={`price-${range.id}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
                  {range.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Material Filter */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('material')}
          className="flex justify-between items-center w-full mb-4"
        >
          <h4 className="text-sm font-medium text-gray-900">Fabric</h4>
          <div className="flex items-center">
            {selectedFabrics.length > 0 && (
              <span className="mr-2 inline-flex items-center justify-center h-5 w-5 bg-pink-100 text-pink-800 text-xs font-semibold rounded-full">
                {selectedFabrics.length}
              </span>
            )}
            {openSections.material ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
          </div>
        </button>
        
        {openSections.material && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {availableFabrics && availableFabrics.length > 0 ? (
              availableFabrics.map(material => (
                <div key={material} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`material-${material}`}
                    checked={selectedFabrics.includes(material)}
                    onChange={() => toggleFabric(material)}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor={`material-${material}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
                    {material}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No fabric options available</p>
            )}
          </div>
        )}
      </div>
      
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <style>{styles}</style>
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{styles}</style>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 sticky top-0 bg-gray-50 pt-6 pb-2 z-10">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 tracking-wide text-center mb-3">
              {subCategoryName
                ? normalize(subCategoryName)
                : (categoryName || defaultCategory
                    ? normalize(categoryName || defaultCategory)
                    : 'All Sarees')}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#7A2A2A] via-[#A56E2C] to-[#C89D4B] rounded-full"></div>
          </div>
        </div>

        <div className="flex gap-6 relative">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-[120px] bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[calc(100vh-140px)] overflow-y-auto scrollbar-hide z-10">
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Button & Active Filters */}
            <div className="lg:hidden mb-4 space-y-3">
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                <FaFilter className="text-gray-500" />
                <span className="font-medium">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-2 px-2.5 py-0.5 bg-pink-100 text-pink-800 text-xs font-semibold rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Active Filters Pills */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPriceRange && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      {priceRanges.find(r => r.id === selectedPriceRange)?.label}
                      <button 
                        onClick={() => setSelectedPriceRange(null)}
                        className="ml-2 hover:text-pink-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {(customPriceFrom || customPriceTo) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      ₹{customPriceFrom || '0'} - ₹{customPriceTo || '∞'}
                      <button 
                        onClick={() => {
                          setCustomPriceFrom('');
                          setCustomPriceTo('');
                        }}
                        className="ml-2 hover:text-pink-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {selectedFabrics.map(fabric => (
                    <span key={fabric} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      {fabric}
                      <button 
                        onClick={() => toggleFabric(fabric)}
                        className="ml-2 hover:text-pink-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Results Bar */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              {/* <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
              </p> */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                <select 
                  id="sort" 
                  className="text-sm border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  onChange={(e) => {
                    const sorted = [...filteredProducts];
                    switch(e.target.value) {
                      case 'price-low-high':
                        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                        break;
                      case 'price-high-low':
                        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                        break;
                      case 'newest':
                        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                        break;
                      default:
                        break;
                    }
                    setFilteredProducts(sorted);
                  }}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>
            
            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {filteredProducts.map((p) => (
                  <div
                    key={p._id || p.title}
                    className="group bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-pink-100"
                    onClick={() => handleCardClick(p)}
                  >
                    <div className="relative w-full aspect-[3/4] bg-gray-50">
                      <img
                        src={p.images?.image1 || 'https://via.placeholder.com/300x400?text=Image+Not+Available'}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x400?text=Image+Not+Available';
                        }}
                      />
                      {(p.discountPercent > 0 || p.discount) && (
                        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white text-green-600 border border-green-600 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                          {p.discountPercent || p.discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="relative p-4">
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7A2A2A] via-[#A56E2C] to-[#C89D4B] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10"></div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-medium text-gray-600 line-clamp-1">
                          {p.product_info?.manufacturer || 'VARNICRAFTS'}
                        </h3>
                      </div>
                      <p className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">{p.title || 'Untitled Product'}</p>
                
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <div className="flex items-center">
                          <FaRupeeSign className="h-3.5 w-3.5 text-gray-900" />
                          <span className="text-lg font-bold text-gray-900 ml-0.5">
                            {p.price?.toLocaleString() || Math.round(p.mrp - p.mrp * ((p.discountPercent || 0) / 100)).toLocaleString()}
                          </span>
                        </div>
                        {p.mrp && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{p.mrp.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}></div>
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <FilterContent />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#7A2A2A] to-[#C89D4B] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;