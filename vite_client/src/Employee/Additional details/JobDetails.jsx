import React, { useRef, useState } from 'react';
import { BOTH_DOCUMENT_ENDPOINT } from '../../utils/constant';

const JobDetails = () => {
    const employeeId = localStorage.getItem('employeeId');
    const [additionalInfo, setAdditionalInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const offerLetterRef = useRef(null);
    const birthCertificateRef = useRef(null);
    const guarantorFormRef = useRef(null);
    const degreeCertificateRef = useRef(null);

    const handleAdditionalInfoChange = (type, field, value) => {
        setAdditionalInfo(prev => ({
            ...prev,
            [type]: {
                ...(prev[type] || {}),
                [field]: value
            }
        }));
    };

    const handleUpload = async (file, documentType) => {
        if (!file) {
            alert(`Please select a file for ${documentType}`);
            return;
        }

        setIsLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('documentType', documentType);
            
            if (additionalInfo[documentType]) {
                formData.append('additionalInfo', JSON.stringify(additionalInfo[documentType]));
            }

            const response = await fetch(`${BOTH_DOCUMENT_ENDPOINT}/document-upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Failed to upload ${documentType}`);
            }

            alert(`${documentType} uploaded successfully!`);
            switch(documentType) {
                case 'OFFER_LETTER':
                    offerLetterRef.current.value = '';
                    break;
                case 'BIRTH_CERTIFICATE':
                    birthCertificateRef.current.value = '';
                    break;
                case 'GUARANTOR_FORM':
                    guarantorFormRef.current.value = '';
                    break;
                case 'DEGREE_CERTIFICATE':
                    degreeCertificateRef.current.value = '';
                    break;
            }
        } catch (error) {
            console.error(`Error uploading ${documentType}:`, error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="lg:ml-74 xl:ml-74 md:ml-64 sm:ml-0 p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center">
            <div className="w-full max-w-4xl">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">Job Details / Upload Documents</h2>
                <div className="space-y-4 md:space-y-6">

                    {/* Offer Letter */}
                    <div className="border p-3 md:p-4 rounded-lg bg-white shadow-sm">
                        <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3">Offer Letter</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-gray-700 text-sm md:text-base">Upload File</label>
                                <input 
                                    type="file" 
                                    ref={offerLetterRef} 
                                    className="border p-2 rounded w-full text-sm"
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-gray-700 text-sm md:text-base">Effective Date</label>
                                <input
                                    type="date"
                                    onChange={(e) => handleAdditionalInfoChange('OFFER_LETTER', 'effectiveDate', e.target.value)}
                                    className="border p-2 rounded text-sm"
                                />
                            </div>
                            <button
                                onClick={() => handleUpload(offerLetterRef.current.files[0], 'OFFER_LETTER')}
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 text-sm md:text-base w-full md:w-auto md:self-end"
                            >
                                {isLoading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>

                    {/* Birth Certificate */}
                    <div className="border p-3 md:p-4 rounded-lg bg-white shadow-sm">
                        <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3">Birth Certificate</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-gray-700 text-sm md:text-base">Upload File</label>
                                <input 
                                    type="file" 
                                    ref={birthCertificateRef} 
                                    className="border p-2 rounded w-full text-sm"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                            </div>
                            <button
                                onClick={() => handleUpload(birthCertificateRef.current.files[0], 'BIRTH_CERTIFICATE')}
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 text-sm md:text-base w-full md:w-auto md:self-end"
                            >
                                {isLoading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>

                    {/* Guarantor Form */}
                    <div className="border p-3 md:p-4 rounded-lg bg-white shadow-sm">
                        <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3">Guarantor's Form</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-gray-700 text-sm md:text-base">Upload File</label>
                                <input 
                                    type="file" 
                                    ref={guarantorFormRef} 
                                    className="border p-2 rounded w-full text-sm"
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="font-medium text-gray-700 text-sm md:text-base">Guarantor Name</label>
                                    <input
                                        type="text"
                                        onChange={(e) => handleAdditionalInfoChange('GUARANTOR_FORM', 'guarantorName', e.target.value)}
                                        className="border p-2 rounded text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-medium text-gray-700 text-sm md:text-base">Guarantor Contact</label>
                                    <input
                                        type="text"
                                        onChange={(e) => handleAdditionalInfoChange('GUARANTOR_FORM', 'guarantorContact', e.target.value)}
                                        className="border p-2 rounded text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => handleUpload(guarantorFormRef.current.files[0], 'GUARANTOR_FORM')}
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 text-sm md:text-base w-full md:w-auto md:self-end"
                            >
                                {isLoading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>

                    {/* Degree Certificate */}
                    <div className="border p-3 md:p-4 rounded-lg bg-white shadow-sm">
                        <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3">Degree Certificate</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-gray-700 text-sm md:text-base">Upload File</label>
                                <input 
                                    type="file" 
                                    ref={degreeCertificateRef} 
                                    className="border p-2 rounded w-full text-sm"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="font-medium text-gray-700 text-sm md:text-base">Institution</label>
                                    <input
                                        type="text"
                                        onChange={(e) => handleAdditionalInfoChange('DEGREE_CERTIFICATE', 'institution', e.target.value)}
                                        className="border p-2 rounded text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-medium text-gray-700 text-sm md:text-base">Year Obtained</label>
                                    <input
                                        type="text"
                                        onChange={(e) => handleAdditionalInfoChange('DEGREE_CERTIFICATE', 'yearObtained', e.target.value)}
                                        className="border p-2 rounded text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => handleUpload(degreeCertificateRef.current.files[0], 'DEGREE_CERTIFICATE')}
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 text-sm md:text-base w-full md:w-auto md:self-end"
                            >
                                {isLoading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default JobDetails;