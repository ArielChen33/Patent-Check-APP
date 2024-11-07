import React, { useState } from 'react';

function SavedReports({ savedReports, onDeleteReport }) {
  const [selectedReport, setSelectedReport] = useState(null);

  const viewReport = (report) => {
    setSelectedReport(report);
  };

  const closeReport = () => {
    setSelectedReport(null);
  };

  return (
    <div className="container saved-reports">
      <h2>Saved Reports</h2>
      {savedReports.length === 0 ? (
        <p>No saved reports yet.</p>
      ) : (
        savedReports.map((report) => (
          <div key={report.analysis_id} className="report-box">
            <h4>Company: {report.company_name}</h4>
            <p>Patent ID: {report.patent_id}</p>
            <p>Analysis Date: {report.analysis_date}</p>
            <button onClick={() => viewReport(report)} className="view-button">View Report</button>
            <br></br>
            <br></br>
            <button onClick={() => onDeleteReport(report.analysis_id)} className="delete-button">Delete Report</button>
          </div>
        ))
      )}

      {/* Display Selected Report in Detail */}
      {selectedReport && (
        <div className="modal">
          <div className="modal-content">
            <h3>Detailed Report for {selectedReport.company_name}</h3>
            <p>Patent ID: {selectedReport.patent_id}</p>
            <p>Analysis Date: {selectedReport.analysis_date}</p>
            <h3>Top Infringing Products</h3>
            {selectedReport.top_infringing_products.map((product, idx) => (
              <div key={idx} className="product-box">
                <h4>{product.product_name}</h4>
                <p>Likelihood: {product.infringement_likelihood}</p>
                <p>Relevant Claims: {product.relevant_claims.join(", ")}</p>
                <p>Explanation: {product.explanation}</p>
                <p>Specific Features:</p>
                <ul>
                  {product.specific_features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
            <h3>Overall Risk Assessment</h3>
            <p>{selectedReport.overall_risk_assessment}</p>
            <button onClick={closeReport} className="close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedReports;
