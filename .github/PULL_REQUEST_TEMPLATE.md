<!-- Every PR must include 4 sections: 
- Motivation and Context: Overview of the Pull Request
- Description: Detailed description of the code implementation. 
- Testing: Steps you took (if any), to test the stability and quality of your implemented code. 
- Checklist: Self-review checklist that has to be completed before you request a review. -->

## Motivation and Context
<!--- For code addition: Which functions/features are implemented? Why are they added? -->
This is a pull request template. 
<!--- For code modifications: Why is this change required? What problem does it solve? -->
This template aims to guide developers of this codebase to better explain their modifications to the project code. 



## Description
<!--- In steps, explain the methodology of your implementation, what you did, and why you chose this approach over others(if any, please specify). -->
### Strategy


<!--- Describe your changes in detail. -->
### Overall Changes

### API Changes
<!-- If applicable, list any API changes made -->
- 
- 
- 



<!--- Any recommended review steps or notes to the reviewer of the code? -->
### Notes
To all reviewers: Please read through all diffs in all changed files and ensure that every line of code makes sense to you. Do not hesitate to comment/ask/request modifications if you find it necessary. 


## Testing
<!--- Please describe in detail how you tested your changes. -->
In this section you can list the test cases or scenarios you have tested on the new code. E.g.: 
1. Any method of testing: 
    - Checked UI of buttons A,B and pages 1,2 and found no anomalies or faults. 
    - Built the test multiple times and tested functionality on multiple devices. 
2. Happy (positive) test case scenarios: (tests that the code performs expected behavior)
    - Given I am on Page 2; When I press button A; Then I am redirected to page 1, and page 1 shows the correct content. 
    - Given I am on Page 1; When I press button B; Then I am redirected to page 2, and page 2 shows the correct content. 
3. Negative test case scenarios: (tests that the code does not show unexpected behavior)
    - Given I am on Page 2; When I press button B; Then I should stay on original page, and no content should change. 
    - Given I am on Page 1; When I press button A; Then I should stay on original page, and no content should change.


<!--- Specify if your change affects other areas of the code. -->


## Checklist
<!--- Go over all the following points, and put an `x` in all the boxes that apply. -->
- [ ] I have rebased this branch to follow the target branch I want to merge into. 
- [ ] I have thoroughly tested my code and described the pull request clearly. 
- [ ] I have performed a self-review of my code and have made sure all modified files are intentional changes. - [ ] My code follows the style guidelines of this project
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation