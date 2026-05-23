import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Search, FileText, Video, ExternalLink, RefreshCw, Upload, Plus, X } from 'lucide-react';

const Resources = () => {
  const { user } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [community, setCommunity] = useState([]);
  
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  
  const [videoError, setVideoError] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('UPSC');
  const [activeTab, setActiveTab] = useState('VIDEOS'); // 'VIDEOS', 'PDFS', 'COMMUNITY'
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '', description: '', resource_type: 'pdf', url: '', file: null
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchVideos();
    fetchPdfs();
    fetchCommunity();
    // eslint-disable-next-line
  }, []);

  const fetchVideos = async (query = searchTerm) => {
    try {
      setLoadingVideos(true);
      setVideoError(null);
      const res = await api.get(`resources/videos/?q=${query} preparation`);
      setVideos(res.data);
    } catch (err) {
      console.error('Video fetch error:', err);
      setVideoError('No data available');
    } finally {
      setLoadingVideos(false);
    }
  };

  const fetchPdfs = async (query = searchTerm) => {
    try {
      setLoadingPdfs(true);
      setPdfError(null);
      const res = await api.get(`resources/pdfs/?q=${query} notes PDF`);
      setPdfs(res.data);
    } catch (err) {
      console.error('PDF fetch error:', err);
      setPdfError('No data available');
    } finally {
      setLoadingPdfs(false);
    }
  };

  const fetchCommunity = async () => {
    try {
      setLoadingCommunity(true);
      const res = await api.get(`resources/community/`);
      setCommunity(res.data);
    } catch (err) {
      console.error('Community fetch error:', err);
    } finally {
      setLoadingCommunity(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'VIDEOS') fetchVideos(searchTerm);
    else if (activeTab === 'PDFS') fetchPdfs(searchTerm);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('resource_type', uploadForm.resource_type);
      if (uploadForm.url) formData.append('url', uploadForm.url);
      if (uploadForm.file) formData.append('file', uploadForm.file);

      await api.post('resources/community/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowUploadModal(false);
      setUploadForm({ title: '', description: '', resource_type: 'pdf', url: '', file: null });
      fetchCommunity();
      setActiveTab('COMMUNITY');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload resource. Please check the fields.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg pt-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-navy-blue">Study Resources</h1>
            </div>
            <p className="text-gray-600 mt-1">Real-time curated content and community shared materials</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab !== 'COMMUNITY' && (
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search topic..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-navy-blue focus:border-transparent outline-none transition-shadow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button type="submit" className="flex items-center justify-center px-4 py-2 bg-navy-blue text-white rounded-lg hover:bg-opacity-90 transition-colors">
                  <RefreshCw className="w-4 h-4 mr-2" /> Search
                </button>
              </form>
            )}
            
            <button 
              onClick={() => {
                if(!user) {
                  alert('Please login to upload resources.');
                  return;
                }
                setShowUploadModal(true);
              }}
              className="flex items-center justify-center px-4 py-2 bg-india-saffron text-white rounded-lg hover:bg-orange-500 transition-colors shadow-sm whitespace-nowrap"
            >
              <Upload className="w-4 h-4 mr-2" /> Upload
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <button
            className={`pb-3 px-4 text-sm font-bold whitespace-nowrap ${activeTab === 'VIDEOS' ? 'border-b-2 border-navy-blue text-navy-blue' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('VIDEOS')}
          >
            Video Resources
          </button>
          <button
            className={`pb-3 px-4 text-sm font-bold whitespace-nowrap ${activeTab === 'PDFS' ? 'border-b-2 border-navy-blue text-navy-blue' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('PDFS')}
          >
            Reference Sites
          </button>
          <button
            className={`pb-3 px-4 text-sm font-bold whitespace-nowrap flex items-center gap-1 ${activeTab === 'COMMUNITY' ? 'border-b-2 border-india-saffron text-india-saffron' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('COMMUNITY')}
          >
            Community Uploads
          </button>
        </div>

        {/* Videos Section */}
        {activeTab === 'VIDEOS' && (
          <div>
            {loadingVideos ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64"></div>
                ))}
              </div>
            ) : videoError ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">{videoError}</h3>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">No videos found</h3>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video, idx) => (
                  <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col">
                    {video.thumbnail && (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-md font-bold text-gray-900 mb-1 line-clamp-2">{video.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{video.channel_name}</p>

                      <div className="mt-auto pt-4 border-t border-gray-50">
                        <a href={video.video_link} target="_blank" rel="noreferrer" className="text-navy-blue hover:text-blue-700 font-medium text-sm flex items-center transition-colors">
                          Watch Video <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PDFs Section */}
        {activeTab === 'PDFS' && (
          <div>
            {loadingPdfs ? (
              <div className="flex flex-col space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-24"></div>
                ))}
              </div>
            ) : pdfError ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">{pdfError}</h3>
              </div>
            ) : pdfs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">No PDFs found</h3>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {pdfs.map((pdf, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center space-x-2 mb-2">
                         <FileText className="w-5 h-5 text-red-500" />
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{pdf.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{pdf.snippet}</p>
                    </div>
                    <a href={pdf.link} target="_blank" rel="noreferrer" className="whitespace-nowrap px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm flex items-center transition-colors">
                      View site <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Community Uploads Section */}
        {activeTab === 'COMMUNITY' && (
          <div>
            {loadingCommunity ? (
              <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-india-saffron" /></div>
            ) : community.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Community Uploads Yet</h3>
                <p className="text-gray-500">Be the first to share a helpful resource!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {community.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-xl ${item.resource_type === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
                        {item.resource_type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md uppercase">
                        By {item.uploaded_by_name || 'Admin'}
                      </span>
                    </div>
                    <h3 className="text-md font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">{item.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50">
                      <a href={item.file_url || item.url} target="_blank" rel="noreferrer" 
                        className="text-india-saffron hover:text-orange-600 font-bold text-sm flex items-center transition-colors">
                        Access Resource <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Share a Resource</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                <input required type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-india-saffron outline-none"
                  value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} placeholder="e.g., Best physics formulas sheet" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea required rows="3" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-india-saffron outline-none"
                  value={uploadForm.description} onChange={e => setUploadForm({...uploadForm, description: e.target.value})} placeholder="Why is this resource helpful?" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Resource Type</label>
                <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-india-saffron outline-none"
                  value={uploadForm.resource_type} onChange={e => setUploadForm({...uploadForm, resource_type: e.target.value, file: null, url: ''})}>
                  <option value="pdf">PDF File</option>
                  <option value="video">Video Link</option>
                  <option value="article">Article/Website Link</option>
                </select>
              </div>

              {uploadForm.resource_type === 'pdf' ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Upload PDF</label>
                  <input required type="file" accept="application/pdf" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                    onChange={e => setUploadForm({...uploadForm, file: e.target.files[0]})} />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Link (URL)</label>
                  <input required type="url" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-india-saffron outline-none"
                    value={uploadForm.url} onChange={e => setUploadForm({...uploadForm, url: e.target.value})} placeholder="https://..." />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="flex-1 py-3 bg-india-saffron text-white rounded-xl font-bold hover:bg-orange-500 disabled:opacity-50">
                  {isUploading ? 'Uploading...' : 'Share Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Resources;
