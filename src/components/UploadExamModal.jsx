import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';
import { getCategories, submitExam } from '../api/examsAPI';

const UploadExamModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    conducting_body: '',
    eligibility: '',
    syllabus: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      getCategories().then(res => {
        setCategories(res.data.results || res.data || []);
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await submitExam(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({ category: '', name: '', conducting_body: '', eligibility: '', syllabus: '' });
      }, 3000);
    } catch (err) {
      setError('Failed to submit exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-navy-blue flex items-center gap-2">
              <Upload className="w-5 h-5" /> Contribute an Exam
            </h2>
            <p className="text-xs text-gray-500 mt-1">Submit an exam to be verified and published by our team.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Submitted Successfully!</h3>
            <p className="text-gray-500">Your exam has been submitted to the administration team for review. It will be published upon approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category / Sector *</label>
              <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-navy-blue"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Exam Name *</label>
              <input required type="text" placeholder="e.g. UPSC Civil Services"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-navy-blue"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Conducting Body *</label>
              <input required type="text" placeholder="e.g. Union Public Service Commission"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-navy-blue"
                value={formData.conducting_body} onChange={e => setFormData({...formData, conducting_body: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Eligibility Criteria *</label>
              <textarea required rows="2" placeholder="Age, Education, etc."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-navy-blue resize-none"
                value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Syllabus Overview *</label>
              <textarea required rows="3" placeholder="Brief syllabus details..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-navy-blue resize-none"
                value={formData.syllabus} onChange={e => setFormData({...formData, syllabus: e.target.value})} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-navy-blue text-white rounded-xl font-bold hover:bg-blue-900 transition-colors mt-4 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadExamModal;
