import {useState, useEffect, useCallback} from 'react';
import firestore from '@react-native-firebase/firestore';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import {formatDateOnly, requestStoragePermission} from './useCustomHooks';
import {Category, Report} from '../../types/types';

const useReportDetail = (reportId?: string, inspectorName?: string) => {
  const [propertyData, setPropertyData] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadloading, setDownloadLoading] = useState(false);
  const [collapsedStates, setCollapsedStates] = useState<
    Record<string, boolean>
  >({});
  const [nestedCollapsed, setNestedCollapsed] = useState<
    Record<string, boolean>
  >({});
  const [reports, setReports] = useState<Report>({});

  const signatureDate = reports?.signature?.timestamp?.seconds || null;
  const signedDate = signatureDate
    ? formatDateOnly(signatureDate)
    : 'Not signed';

  const transformReportData = (reportData: {categories: any[]}) => {
    if (!reportData.categories || !reportData.categories[0]) return [];

    const categories = reportData.categories[0];
    const result = [];

    // Loop through each category (bathroom, masterBedroom, etc.)
    for (const [categoryName, categoryData] of Object.entries(categories)) {
      const subcategories = categoryData.subcategories.map(sub => ({
        name: sub.name,
        inspection_status: sub.inspection_status,
        comment: sub.comment,
        images: sub.images,
      }));

      result.push({
        type: categoryName,
        subcategories: subcategories,
      });
    }

    return result;
  };
  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (!reportId) return;

        const documentSnapshot = await firestore()
          .collection('reports')
          .doc(reportId)
          .get();

        if (documentSnapshot.exists()) {
          const reportData = documentSnapshot.data();
          setReports(reportData);
          // Transform the data for FlatList
          setPropertyData(transformReportData(reportData));
        } else {
          console.log('No report found for the given ID');
        }
      } catch (error) {
        console.log('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const signatureUrl = reports?.signature?.url || null;

  // Fetch report data
  // const fetchReport = useCallback(async () => {
  //   try {
  //     if (!reportId) return;

  //     const documentSnapshot = await firestore()
  //       .collection('reports')
  //       .doc(reportId)
  //       .get();

  //     if (documentSnapshot.exists()) {
  //       const reportData = documentSnapshot.data() as Report;
  //       setReports(reportData);
  //       setPropertyData(transformReportData(reportData));
  //     }
  //   } catch (error) {
  //     console.log('Error fetching report:', error);
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Error',
  //       text2: 'Failed to load report data',
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [reportId, transformReportData]);

  // Generate PDF report
  const generatePDF = useCallback(async () => {
    try {
      setDownloadLoading(true);
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) return;

      // Format date helper
      const formatDate = (timestamp?: {seconds: number}) => {
        if (!timestamp?.seconds) return 'N/A';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString();
      };

      // Status color mapping
      const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
          case 'completed':
            return '#4CAF50';
          case 'in progress':
            return '#FFC107';
          case 'pending':
            return '#9E9E9E';
          default:
            return '#2196F3';
        }
      };

      // Condition color mapping
      const getConditionColor = (condition?: string) => {
        switch (condition?.toLowerCase()) {
          case 'dirty':
            return '#d73038';
          case 'damaged':
            return '#d73038';
          default:
            return '#4CAF50';
        }
      };
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Inspection Report</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            max-width: 1000px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #008080;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #008080;
            margin-bottom: 5px;
        }
        .header .subtitle {
            color: #666;
            font-size: 16px;
        }
        .property-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .info-item strong {
            display: inline-block;
            width: 150px;
            color: #555;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 13px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            color: white;
        }
        .section-title {
            background-color: #008080;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            margin: 25px 0 15px 0;
            font-size: 18px;
        }
        .category {
            margin-bottom: 25px;
        }
        .category-title {
            font-weight: bold;
            font-size: 16px;
            color: #444;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px dashed #ddd;
        }
        .subcategory {
            margin-left: 15px;
            margin-bottom: 15px;
        }
        .subcategory-title {
            font-weight: bold;
            color: #555;
        }
        .subcategory-details {
            margin-left: 15px;
            margin-top: 5px;
        }
        .signature-section {
            margin-top: 40px;
            text-align: center;
        }
        .signature-img {
            max-width: 200px;
            height: auto;
            margin-top: 10px;
            border-top: 1px solid #333;
            padding-top: 10px;
            display: inline-block;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
        .image-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 10px;
        }
        .image-item {
            border: 1px solid #ddd;
            padding: 5px;
            text-align: center;
        }
        .image-item img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Property Inspection Report</h1>
        <div class="subtitle">Comprehensive property condition assessment</div>
    </div>
    
 <div class="image-section">
        <div class="section-title">Property Images</div>
        ${
          reports.images && reports.images.length > 0
            ? `
            <div class="image-grid">
                ${reports.images
                  .map(
                    (image: string, index: number) => `
                    <div class="image-container">
                        <img src="${image}" alt="Property Image ${index + 1}" />
                        <div class="image-label">Image ${index + 1}</div>
                    </div>
                `,
                  )
                  .join('')}
            </div>
        `
            : '<p>No property images available</p>'
        }
    </div>
    <div class="property-info">
        <div class="info-grid">
            <div class="info-item">
                <strong>Property Name:</strong> ${reports?.name || 'N/A'}
            </div>
            <div class="info-item">
                <strong>Address:</strong> ${reports?.address || 'N/A'}
            </div>
            <div class="info-item">
                <strong>Inspection Date:</strong> ${formatDate(
                  reports?.create_at,
                )}
            </div>
            <div class="info-item">
                <strong>Last Updated:</strong> ${formatDate(reports?.update_at)}
            </div>
            <div class="info-item">
                <strong>Status:</strong> 
                <span class="status-badge" style="background-color: ${getStatusColor(
                  reports?.status,
                )};">
                    ${reports?.status || 'N/A'}
                </span>
            </div>
            <div class="info-item">
                <strong>Overall Condition:</strong> 
                <span class="status-badge" style="background-color: ${getConditionColor(
                  reports?.overall_condition,
                )};">
                    ${reports?.overall_condition || 'N/A'}
                </span>
            </div>
        </div>
        <div class="info-item">
            <strong>Description:</strong> ${
              reports?.description || 'No description provided'
            }
        </div>
    </div>

    <div class="section-title">Inspection Details</div>

    ${
      reports?.categories
        ?.map((category: {[s: string]: unknown} | ArrayLike<unknown>) => {
          return Object.entries(category)
            .map(
              ([categoryName, categoryData]) => `
            <div class="category">
                <div class="category-title">${categoryName
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())}</div>
                ${categoryData?.subcategories
                  ?.map(
                    (subcategory: {
                      name: any;
                      inspection_status: any;
                      comment: any;
                      images: any[];
                    }) => `
                    <div class="subcategory">
                        <div class="subcategory-title">${subcategory.name}</div>
                        <div class="subcategory-details">
                            <strong>Status:</strong> ${
                              subcategory.inspection_status
                            }<br>
                            <strong>Comments:</strong> ${
                              subcategory.comment || 'No comments'
                            }<br>
                            ${
                              subcategory.images?.length > 0
                                ? `
                                <strong>Images:</strong>
                                <div class="image-grid">
                                    ${subcategory.images
                                      .map(
                                        (image: any) => `
                                        <div class="image-item">
                                            <img src="${image}" alt="Inspection Image">
                                        </div>
                                    `,
                                      )
                                      .join('')}
                                </div>
                            `
                                : '<strong>Images:</strong> No images'
                            }
                        </div>
                    </div>
                `,
                  )
                  .join('')}
            </div>
        `,
            )
            .join('');
        })
        .join('') || '<p>No inspection categories found</p>'
    }

    ${
      reports?.signature?.signature
        ? `
        <div class="signature-section">
            <div><strong>Inspector's Signature</strong></div>
            <img class="signature-img" src="${
              reports.signature.signature
            }" alt="Signature">
            <div>Date: ${formatDate(reports.update_at)}</div>
        </div>
    `
        : ''
    }

    <div class="footer">
        This report was generated automatically on ${new Date().toLocaleDateString()}.<br>
        © ${new Date().getFullYear()} Property Inspection System. All rights reserved.
    </div>
</body>
</html>
`;

      const options = {
        html: htmlContent,
        fileName: `Inspection_Report_${
          reports?.name?.replace(/\s+/g, '_') || Date.now()
        }`,
        directory: 'Documents',
      };

      const pdf = await RNHTMLtoPDF.convert(options);
      if (!pdf.filePath) throw new Error('PDF generation failed');

      // Handle duplicate file names
      let downloadPath = `${RNFS.DownloadDirectoryPath}/${options.fileName}.pdf`;
      let counter = 1;
      while (await RNFS.exists(downloadPath)) {
        downloadPath = `${RNFS.DownloadDirectoryPath}/${options.fileName} (${counter}).pdf`;
        counter++;
      }

      await RNFS.moveFile(pdf.filePath, downloadPath);

      if (await RNFS.exists(downloadPath)) {
        Toast.show({
          type: 'success',
          text1: 'PDF Downloaded',
          text2: `Saved as ${downloadPath.split('/').pop()}`,
        });
      } else {
        throw new Error('File not found after move');
      }
    } catch (err) {
      console.error('PDF Error:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not save PDF: ' + (err.message || 'Unknown error'),
      });
    } finally {
      setDownloadLoading(false);
    }
  }, [reports, requestStoragePermission]);

  // Toggle collapse state
  const toggleCollapse = useCallback((key: string) => {
    setCollapsedStates(prev => ({...prev, [key]: !prev[key]}));
  }, []);

  // Toggle nested collapse state
  const toggleNestedCollapse = useCallback((key: string) => {
    setNestedCollapsed(prev => ({...prev, [key]: !prev[key]}));
  }, []);

  // useEffect(() => {
  //   fetchReport();
  // }, [fetchReport]);

  return {
    reports,
    propertyData,
    loading,
    downloadloading,
    collapsedStates,
    nestedCollapsed,
    signatureUrl,
    signedDate,
    inspectorName,

    setCollapsedStates,
    setNestedCollapsed,
    toggleCollapse,
    toggleNestedCollapse,
    generatePDF,
  };
};

export default useReportDetail;
