// import { useState, useCallback } from 'react';
// import patentsData from "../utils/patents.json";
// import companiesData from "../utils/company_products.json";
// import stringSimilarity from 'string-similarity';

// function Home({ onSaveReport, savedReports }) {
//   const [terms, setTerms] = useState({
//     patent_id: "", 
//     company_name: ""
//   });
//   const [results, setResults] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleChange = useCallback((e) => {
//     const {value, name} = e.target;
//     setTerms(prevTerms => {
//       return {...prevTerms, [name]: value};
//     })
//   }, []);

//   const handleSearch = useCallback(async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);

//     try{
//       const patent = patentsData.find(pat => pat.publication_number === terms.patent_id);
//       const company = companiesData.companies.find(comp => comp.name.toLowerCase().includes(terms.company_name.toLowerCase()));

//       if (!patent){
//         throw new Error("Patent not found.");
//       }
//       if(!company){
//         throw new Error("Company not found.");
//       }

//       const report = await generateInfringementReport(patent, company);
//       setResults(report);
//     }catch(err){
//       setError(err.message);
//       setResults(null);
//     }finally{
//       setIsLoading(false);
//     }
//   }, [terms]);

//   const generateInfringementReport = useCallback(async (patent, company) => {
//     const report = {
//       analysis_id: Date.now().toString(),
//       patent_id: patent.publication_number,
//       company_name: company.name,
//       analysis_date: new Date().toISOString().split("T")[0],
//       top_infringing_products: [],
//       overall_risk_assessment: ""
//     };

//     for (const product of company.products) {
//       const infringementLikelihood = await assessInfringementLikelihood(patent, product);
      
//       if (infringementLikelihood.relevantClaims.length > 0) {
//         report.top_infringing_products.push({
//           product_name: product.name,
//           infringement_likelihood: infringementLikelihood.likelihood,
//           relevant_claims: infringementLikelihood.relevantClaims,
//           explanation: infringementLikelihood.explanation,
//           specific_features: infringementLikelihood.specificFeatures
//         });
//       }
//     }

//     report.overall_risk_assessment = assessOverallRisk(report.top_infringing_products);
//     return report;
//   }, []);

//   const assessInfringementLikelihood = useCallback(async (patent, product) => {
//     const relevantClaims = [];
//     const specificFeatures = [];
//     let explanation = ""; 
//     let likelihood = "Low" // Default setting

//     let claimsArray = [];
//     try{
//       claimsArray = typeof patent.claims === "string" ? JSON.parse(patent.claims) : patent.claims;
//     }catch(err){
//       console.error("Failed to parse claims: ", error);
//     }

//     const claimTexts = claimsArray.map(claim => claim.text);
//     const productDescription = product.description;

//     for (let i = 0; i < claimTexts.length; i++) {
//       const similarity = stringSimilarity.compareTwoStrings(
//         claimTexts[i].toLowerCase(), 
//         productDescription.toLowerCase()
//       );
//     //   console.log("similarity: ", similarity);
//       if (similarity > 0.4) {
//         relevantClaims.push(claimsArray[i].num * 1);
//         specificFeatures.push(`Feature matches claim ${claimsArray[i].num * 1}`);
//       }
//     }
    
//     if (relevantClaims.length >= 5) {
//       likelihood = "High";
//       explanation = `The product "${product.name}" strongly matches several key elements from the patent claims.`;
//     } else if (relevantClaims.length > 2) {
//       likelihood = "Moderate";
//       explanation = `The product "${product.name}" matches some elements from the patent claims.`;
//     } else {
//       explanation = `The product "${product.name}" has minimal overlap with patent claims.`;
//     }

//     return { likelihood, relevantClaims, explanation, specificFeatures };
//   }, [])


//   const assessOverallRisk = useCallback((products) => {
//     const highRiskCount = products.filter(p => p.infringement_likelihood === "High").length;
//     if (highRiskCount > 0) {
//       return "High risk due to multiple products implementing core elements of the patent.";
//     } else if (products.length > 0) {
//       return "Moderate risk due to potential partial implementations.";
//     } else {
//       return "Low risk with no identified infringements.";
//     }
//   }, []);

//   return (
//     <div className="container">
//       <form onSubmit={handleSearch}>
//         <h2>Patent Infringement Check</h2>
//         <div className="input-field">
//           <label htmlFor="patent_id">Patent ID</label>
//           <input
//             id="patent_id"
//             type="text"
//             name="patent_id"
//             value={terms.patent_id}
//             onChange={handleChange}
//           />
//         </div>
//         <div className="input-field">
//           <label htmlFor="company_name">Company Name</label>
//           <input
//             id="company_name"
//             type="text"
//             name="company_name"
//             value={terms.company_name}
//             onChange={handleChange}
//           />
//         </div>
//         <button type="submit" disabled={isLoading}>
//           {isLoading ? "Searching..." : "Search"}
//         </button>
//         {error && <p className="error">{error}</p>}
//       </form>

//       {error && <p className='error'>{error}</p>}

//         {results && (
//           <div className="results">
//             <h2>Infringement Analysis for {results.company_name}</h2>
//             <p>Patent ID: {results.patent_id}</p>
//             <p>Company Name: {results.company_name}</p>
//             <p>Analysis Date: {results.analysis_date}</p>
//             <h3>Top Infringing Products</h3>
//             {results.top_infringing_products.map((product, idx) => (
//               <div key={idx} className='product-box'>
//                 <h4>{product.product_name}</h4>
//                 <p>Likelihood: {product.infringement_likelihood}</p>
//                 <p>Relevant Claims: {product.relevant_claims.join(", ")}</p>
//                 <p>Explanation: {product.explanation}</p>
//                 <p>Specific Features:</p>
//                 <ul>
//                   {product.specific_features.map((feature, i) => (
//                     <li key={i}>{feature}</li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//             <h3>Overall Risk Assessment</h3>
//             <p>{results.overall_risk_assessment}</p>
//             <button onClick={() => onSaveReport(results)} className="save-button">Save Report</button>
//           </div>
//         )}

//       {/* {results && (
//         <div className="results">
//           <h2>Infringement Analysis for {results.company_name}</h2>
//           <p>Patent ID: {results.patent_id}</p>
//           <p>Analysis Date: {results.analysis_date}</p>
//           <button onClick={() => onSaveReport(results)} className="save-button">Save Report</button>
//         </div>
//       )} */}

//       {/* Display Saved Reports on the Home Page */}
//       <div className="saved-reports">
//         <h2>Recently Saved Reports</h2>
//         {savedReports.length === 0 ? (
//           <p>No saved reports yet.</p>
//         ) : (
//           savedReports.slice(-3).map((report) => (
//             <div key={report.analysis_id} className="report-box">
//               <h4>Company: {report.company_name}</h4>
//               <p>Patent ID: {report.patent_id}</p>
//               <p>Analysis Date: {report.analysis_date}</p>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// export default Home;

import { useState, useCallback } from 'react';
import patentsData from "../utils/patents.json";
import companiesData from "../utils/company_products.json";
import stringSimilarity from 'string-similarity';

function Home({ onSaveReport, savedReports }) {
  const [terms, setTerms] = useState({
    patent_id: "", 
    company_name: ""
  });
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = useCallback((e) => {
    const {value, name} = e.target;
    setTerms(prevTerms => {
      return {...prevTerms, [name]: value};
    })
  }, []);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const patent = patentsData.find(pat => pat.publication_number === terms.patent_id);
      const company = companiesData.companies.find(comp => comp.name.toLowerCase().includes(terms.company_name.toLowerCase()));

      if (!patent) throw new Error("Patent not found.");
      if (!company) throw new Error("Company not found.");

      const report = await generateInfringementReport(patent, company);
      setResults(report);
    } catch(err) {
      setError(err.message);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [terms]);

const generateInfringementReport = useCallback(async (patent, company) => {
    // Generate report with initial structure
    const report = {
      analysis_id: Date.now().toString(),
      patent_id: patent.publication_number,
      company_name: company.name,
      analysis_date: new Date().toISOString().split("T")[0],
      top_infringing_products: [],
      overall_risk_assessment: ""
    };
  
    // Array to hold all products with infringement likelihood
    const allProducts = [];
  
    // Analyze each product and store results with relevant claims count
    for (const product of company.products) {
      const infringementLikelihood = await assessInfringementLikelihood(patent, product);
  
      if (infringementLikelihood.relevantClaims.length > 0) {
        allProducts.push({
          product_name: product.name,
          infringement_likelihood: infringementLikelihood.likelihood,
          relevant_claims: infringementLikelihood.relevantClaims,
          explanation: infringementLikelihood.explanation,
          specific_features: infringementLikelihood.specificFeatures
        });
      }
    }
  
    // Sort products by number of relevant claims in descending order
    allProducts.sort((a, b) => b.relevant_claims.length - a.relevant_claims.length);
  
    // Select top 2 products with highest relevant claims count
    report.top_infringing_products = allProducts.slice(0, 2);
  
    // Assess overall risk based on the top infringing products
    report.overall_risk_assessment = assessOverallRisk(report.top_infringing_products);
    
    return report;
  }, []);
  

  const assessInfringementLikelihood = useCallback(async (patent, product) => {
    const relevantClaims = [];
    const specificFeatures = [];
    let explanation = ""; 
    let likelihood = "Low";

    let claimsArray = [];
    try {
      claimsArray = typeof patent.claims === "string" ? JSON.parse(patent.claims) : patent.claims;
    } catch(err) {
      console.error("Failed to parse claims: ", err);
    }

    const claimTexts = claimsArray.map(claim => claim.text);
    const productDescription = product.description;

    for (let i = 0; i < claimTexts.length; i++) {
      const similarity = stringSimilarity.compareTwoStrings(
        claimTexts[i].toLowerCase(), 
        productDescription.toLowerCase()
      );

      if (similarity > 0.4) {
        relevantClaims.push(claimsArray[i].num * 1);
        specificFeatures.push(`Feature matches claim ${claimsArray[i].num * 1}`);
      }
    }
    
    if (relevantClaims.length >= 5) {
      likelihood = "High";
      explanation = `The product "${product.name}" strongly matches several key elements from the patent claims.`;
    } else if (relevantClaims.length > 2) {
      likelihood = "Moderate";
      explanation = `The product "${product.name}" matches some elements from the patent claims.`;
    } else {
      explanation = `The product "${product.name}" has minimal overlap with patent claims.`;
    }

    return { likelihood, relevantClaims, explanation, specificFeatures };
  }, []);

  const assessOverallRisk = useCallback((products) => {
    const highRiskCount = products.filter(p => p.infringement_likelihood === "High").length;
    if (highRiskCount > 0) {
      return "High risk due to multiple products implementing core elements of the patent.";
    } else if (products.length > 0) {
      return "Moderate risk due to potential partial implementations.";
    } else {
      return "Low risk with no identified infringements.";
    }
  }, []);

  const saveUniqueReport = () => {
    if (!results) return;

    const isDuplicate = savedReports.some(
      report => report.patent_id === results.patent_id && report.company_name === results.company_name
    );

    if (!isDuplicate) {
      onSaveReport(results);
      alert("Report saved successfully!");
    } else {
      alert("This report is already saved.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSearch}>
        <h2>Patent Infringement Check</h2>
        <div className="input-field">
          <label htmlFor="patent_id">Patent ID</label>
          <input
            id="patent_id"
            type="text"
            name="patent_id"
            value={terms.patent_id}
            onChange={handleChange}
          />
        </div>
        <div className="input-field">
          <label htmlFor="company_name">Company Name</label>
          <input
            id="company_name"
            type="text"
            name="company_name"
            value={terms.company_name}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>

      {results && (
        <div className="results">
          <h2>Infringement Analysis for {results.company_name}</h2>
          <p>Patent ID: {results.patent_id}</p>
          <p>Analysis Date: {results.analysis_date}</p>

          <h3>Top Infringing Products</h3>
          {results.top_infringing_products.map((product, idx) => (
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
          <p>{results.overall_risk_assessment}</p>
          <button onClick={saveUniqueReport} className="save-button">Save Report</button>
        </div>
      )}

      {/* Display Recently Saved Reports on the Home Page */}
      <div className="saved-reports">
        <h2>Recently Saved Reports</h2>
        {savedReports.length === 0 ? (
          <p>No saved reports yet.</p>
        ) : (
          savedReports.slice(-3).map((report) => (
            <div key={report.analysis_id} className="report-box">
              <h4>Company: {report.company_name}</h4>
              <p>Patent ID: {report.patent_id}</p>
              <p>Analysis Date: {report.analysis_date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
