// controllers/rulesController.js

exports.showRulesIndex = (req, res) => {
  res.render('rules/rules_index.html');
};

exports.showAttack = (req, res) => {
  res.render('rules/rules_attack.html');
};

exports.showRules = (req, res) => {
  res.render('rules/rules.html');
};